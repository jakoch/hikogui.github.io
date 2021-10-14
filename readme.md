
![the ttauri project: A modern, high-performance, retained-mode, gui library](/assets/images/logos/ttauri-logo-1300x282.png){:width="650px" height="141px"}

[Take Vos](https://github.com/takev/) started this library to make a portable,
high performance and modern looking GUI framework. Which may be used in
proprietary applications through the [BSL-1.0 license](https://opensource.org/licenses/BSL-1.0).

It is specifically designed to display dynamic information at the screen's
refresh rate. Special care is taken for making it easy for GUI element to
observe and modify data external to the GUI.

News: Release-0.5.1 Bad Butterfly
---------------------------------

In the attempt to write easy to understand documentation for several of
ttauri's systems, I reworked the API to make this easier.

One of the more difficult things was to manage the global lifetime of the
subsystems. I was able to simplify this by allowing these subsystems to be
local variables. This was done to the: gui\_system, gfx\_system, audio\_system,
vertical\_sync, theme\_book, font\_book, keyboard\_bindings and preferences.
   
 * Wrote a how-to for logging, counting and tracing:
   - Improved performance of counters.
   - Improved performance of tracing.
   - Replaced time-stamping implementation in reference to `std::chrono::utc_clock`.
 * Wrote a how-to for application preference:
   - Implemented JSON-path for selecting values in a JSON file.
   - Implement `tt::pickle` system to convert between custom types and
     the dynamic data type `tt::datum`.
   - Reimplemented observables with better automatic ownership model and
     better callback handling.
   - Multiple preference-files may now be opened at the same time.
 * Preparing for a how-to for writing custom widgets:
   - Replaced flat shader with a better optimized rounded box shader.
 * Add address-sanitizer builds.
 * Finalize BON8 (Binary Object Notation 8) specification.
 * Add support for using ttauri as a CMake-FetchContent dependency. 

_vcpkg builds are not recommended at the moment due to future
changes of std::format and std::ranges to the c++20 standard.
Please build using non-vcpkg to ensure matching versions of cmake
and the MSVC compiler._

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

