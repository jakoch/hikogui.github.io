
![HikoGUI: A modern, high-performance, retained-mode, gui library](/assets/images/logos/hikogui-logo-1300x282.png){:width="650px" height="141px"}

[Take Vos](https://github.com/takev/) started this library to make a portable,
high performance and modern looking GUI framework. Which may be used in
proprietary applications through the [BSL-1.0 license](https://opensource.org/licenses/BSL-1.0).

It is specifically designed to display dynamic information at the screen's
refresh rate. Special care is taken for making it easy for GUI element to
observe and modify data external to the GUI.

News: Release-0.6.0 Dizzy Donkey
---------------------------------

The focus in this release is on improving the API, documentation and examples for
creating custom widgets and drawing. As an extra I've added the beginnings of
coroutine support. Coroutines is a good way of managing the lifetime and interaction
of windows and their widgets. I am excited to find out if and how coroutines may help
with making applications.

 * The ttauri project is renamed to HikoGUI.
 * The drawing API is more consistent and capable; for example adding
   color gradients, convex quads and allowing glyphs to be overlapped.
 * Improved text rendering:
   - Improved quality of rendering of text by aligning to sub-pixel boundaries..
   - Improved text shaping of multiple paragraphs
   - Better bidirectional text and cursor support.
 * A central API to retrieve user-settings from the operating system,
   including a notifier for the application to directly react on changes.
 * Multi-monitor and DPI scaling support.
 * Improved more efficient and performant event-loop:
   - Thread-local, main-thread and timer-thread event-loops.
   - Event loop can handle: sockets, gui-events, timers, posted functions, vertical sync.
   - Blocks on all these events for efficiency and reaction speed.
 * Improved signaling:
   - Faster and easier to use `observer` objects.
   - `notifier` objects will always post functions on the thread-local event loop,
     this makes it safer to use, as it elliminates reentrancy.
   - Awaiting on `notifier` and `observer` objects and which adds coroutine support
     to handle GUI interactions.

_vcpkg builds are not supported due to problems with c++20 incompatibilties._

_Currently can not be build with Visual Studio 2022 Preview due to compiler bugs._

Features
--------

 - High level API to make simple desktop applications.
 - Modern C++20 library.
 - Retained-mode GUI.
 - GUI will dynamically track the state of the application.
 - Animation at the screen's refresh rate.

{% include figure.html url="/assets/images/screenshots/audio_device_change.gif" description="Audio Selection tracking devices in real time" %}

 - Localization and translation.

{% include figure.html url="/assets/images/screenshots/language_change.gif" description="Multiple language support" %}

 - Themes; including light/dark support.
 - Editable key-bindings.

{% include figure.html url="/assets/images/screenshots/demo_dark_and_light.png" description="Themes with dark and light mode" %}

 - Most or all drawing is GPU accelerated with Vulkan.
 - Text is drawn using kerning, perceptional correct blending and subpixel anti-aliasing.
 - High dynamic range and high gamut color handling.

{% include figure.html url="/assets/images/screenshots/subpixel_glyphs.png" description="Subpixel anti-aliasing" %}

 - Automatic application preferences storage.
 - Many support systems:
   + logging,
   + statistics,
   + text handling,
   + text template language,
   + expression language,
   + dynamic type system.

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

