
![HikoGUI: A modern, high-performance, retained-mode, gui library](/assets/images/logos/hikogui-logo-1000x280.png){:width="500px" height="140px"}

HikoGUI was created to make portable and good looking, realtime applications.

Originally it was designed as the GUI for a portable audio recording application which would
have a lot of widgets (100+), like audio peak-level meters, which would have to animate at the
screen refresh rate.

I used to work at a trading firm where I was inspired by trading applications.
The design of HikoGUI should allow for all the numbers of a spreadsheet like application
to be updated at screen refresh rate.

The library is released under the [BSL-1.0 license](https://opensource.org/licenses/BSL-1.0),
which allows the library to be used in both open-source and proprietary applications.


Retained mode C++20/23 API
--------------------------
HikoGUI uses a modern style C++ [retained mode](https://en.wikipedia.org/wiki/Retained_mode)
API with a clear ownership model. 

In the following example we see a co-routine, unique-pointers and
[RAII](https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization)
being used to clearly communicate the ownership model between GUI elements.

```cpp
hi::task<> main_window()
{
    // The widget that is created here will later be owned by the window,
    // by moving this unique pointer into the window.
    auto widget = std::make_unique<hi::window_widget>(hi::txt("Hello World"));

    // We borrow a reference to the button to await on the button press later.
    auto &button = widget->content().make_widget<hi::momentary_button_widget>(
        "A1", hi::txt("Hello world"));

    // window is owned by this task, when the task exits the window will go
    // out-of-scope and get destructed.
    auto window = hi::gui_window(std::move(widget));

    while (true) {
        auto result = co_await hi::when_any(button.pressed, window.closing);
        switch (result.index()) {
        case 0: // button.pressed
            std::print("Hello World");
            break;        
        case 1: // window.closing
            co_return;
        }
    }
}
```

For some full examples of applications see:
  - <https://github.com/hikogui/hikogui-hello-world/blob/main/src/main.cpp>
  - <https://github.com/hikogui/hikogui/blob/main/examples/hikogui_demo/src/main_impl.cpp>


Animation and Performance
-------------------------
HikoGUI as much as possible is using a single threaded main-loop.
The main-loop will asynchronously handle the following events:
 - keyboard, mouse and other window events,
 - vertical sync,
 - timers,
 - posted functions,
 - audio events (excluding audio I/O), and
 - networking.

The main-loop is inspired by game engines; on each vertical sync all the widgets
draw themselves by adding vertices of shapes and glyphs to draw into to a buffer;
afterwards a draw call is executed on the GPU, drawing the whole window at once;
followed by a [page-flip](https://en.wikipedia.org/wiki/Multiple_buffering).

Some optimizations are added on top of this, such as: only the parts of a window
that needs to change will need to be redrawn, using
[hardware scissors](https://www.khronos.org/opengl/wiki/Scissor_Test).

Because we are rendering everything with the GPU we get
[High Dynamic Range](https://en.wikipedia.org/wiki/High_dynamic_range) and
[Wide Color Gamut](https://en.wikipedia.org/wiki/Gamut)
for free.


A complete GUI
--------------
We want to create a complete GUI with all the features that are needed
to write desktop and mobile applications:

 - localization
 - accessability (not yet)
 - high quality text rendering
   + perceptional correct subpixel anti-aliasing
   + kerning
   + ligatures (not yet)
   + bidirectional text handling
 - theming
 - multi-monitor support
 - high DPI scaling
 - key bindings


Portability
-----------
Although currently only MS Windows and Vulkan are supported HikoGUI is
designed to be easily portable to other platforms. Most, if not all,
of the platform depended code has been separated out and can live
along side other implementations.

Not only should it be easy to port to other compilers and operating
systems we have also abstracted the graphics API and it should
be possible to replace with OpenGL, DirectX or WebGL.

With C++20 modules porting becomes extra simple because you can have
different implementations in different files with the same module
name; CMake then selects the files to include in the
build.


Blog posts
----------
{% for post in site.posts %}
 - [{{ post.title }} ({{post.date | date_to_string }})]({{ post.url }})
{%- endfor %}


Platinum Sponsors
-----------------
The following people and companies are platinum sponsors:

_There are currently no platinum sponsors._

for more sponsers please see our full list of [sponsors](sponsors.md).

