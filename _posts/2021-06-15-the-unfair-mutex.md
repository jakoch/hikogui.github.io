---
layout: default
title: The unfair mutex
---

The Unfair mutex
================
by: Take Vos

When working on TTauri GUI system I needed a recursive mutex that is used often.
However `std::recursive_mutex` implementations can be extremely heavy, dwarving
the amount of code it is protecting.

In my quest to improve the performance of my own `tt::unfair_recursive_mutex`
I came to realize that in certain cases we can safely eliminate the need to
recursively lock, by using a feature of the `tt::unfair_recursive_mutex`
which is unavailabe in `std::recursive_mutex`.

tt::unfair\_mutex
-----------------
The normal [std::mutex] is "fair" meaning that if there are multiple threads
contending for a lock on the mutex, it will fairly determine which will
get the lock.

The [tt::unfair_mutex] does none of this, in fact it may be possible for threads
waiting on a lock to never get woken up, in effect the thread is being [starved].
Therefor the `tt::unfair_mutex` should only be used when it is rare for two
threads to content for a lock.

The `tt::unfair_mutex` is a straight forward implementation from the paper
["Futexes Are Tricky"] by Ulrich Drepper.
Instead of the Futex we can use the new c++20 [std::atomic::wait()] and [std::atomic::notify_one()]
which exposes a limited but generic variant of the futex.

To reduce the code size at the call site of `lock()` we direct the compiler to never inline
the `lock_contented()` function. We also use `[[likely]]` and `[[unlikely]]` to suggest
to the compiler the prefered, non-contended, code-path.

As an extra safety feature we also include a dead-lock detector in debug-builds. This
dead-lock detector checks if mutexes are always locked in the same order.

[std::mutex]: https://en.cppreference.com/w/cpp/thread/mutex
[std::atomic::wait()]: https://en.cppreference.com/w/cpp/atomic/atomic/wait
[std::atomic::notify_one()]: https://en.cppreference.com/w/cpp/atomic/atomic/notify_one
[starved]: https://en.wikipedia.org/wiki/Starvation_(computer_science)
[tt::unfair_mutex]: https://www.ttauri-project.org/docs/ttauri/main/classtt_1_1unfair__mutex.html
["Futexes Are Tricky"]: https://www.akkadia.org/drepper/futex.pdf

tt::unfair\_recursive\_mutex
----------------------------
The [tt::unfair_recursive_mutex] is also a straight forward implementation.
It uses the `tt::unfair_mutex` and the member variables: `owner` (the owning thread id)
and `count` (recurse count).

For performance reasons we need to retrieve the thread id quickly.
On Windows we can retrieve the thread id from the [Thread Information Block].
We can use the following intrinsic `__readgsdword(0x48)` to get the thread id in a single instruction.

On other platforms there are simular solutions to the thread information block.
As a fallback we can use the address of a `thread_local` variable as a thread-id,
since we only need a unique thread id, not the actual operating systems' thread id.

[Thread Information Block]: https://en.wikipedia.org/wiki/Win32_Thread_Information_Block
[tt::unfair_recursive_mutex]: https://www.ttauri-project.org/docs/ttauri/main/classtt_1_1unfair__recursive__mutex.html

External locking
----------------
It is common for a thread-safe class to contain a mutex that is locked inside every
member function of the class, when functions call other functions of the same object
a recursive lock is needed. The idea is instead locking inside the member function to
lock the mutex in the caller of the member function.

{% include figure.html url="/assets/images/posts/the-unfair-mutex.png" description="Internal vs External locking" %}

Of course it would be very easy to forget to lock before calling a function, this is where
the `tt::unfair_recursive_mutex::recurse_lock_count()` function comes in; this function
will return how many times the lock has been taken by the current thread, otherwise zero.

By adding an assert for `tt::unfair_recursive_mutex::recurse_lock_count()` > 0 in
each member function we can make sure that the member function will be called with the
lock held by the current thread.

The assert above is not subject to race conditions, this means we can eliminate the
check in release builds, as long as unit/module/system-tests will exercise every call to the
assert-protected-function at least once.

But the `recurse_lock_count()` function is also very fast, faster than taking a recursive
lock, so a check in release builds may be a good idea in certain cases.

In TTauri there is a global `gui_system_mutex` which is used by widgets, windows and the
rest of the GUI system. Many of the functions in the GUI system only assert on the
`recurse_lock_count()` in expectation that most calls are recursive from somewhere else
in the GUI system. A mixture of some functions asserting and other functions recursively
locking is completely supported.

