
![HikoGUI: A modern, high-performance, retained-mode, gui library](/assets/images/logos/hikogui-logo-1000x280.png){:width="500px" height="140px"}

I, [Take Vos](https://github.com/takev/), made this GUI library to create good looking
realtime applications.

Originally it was designed as the GUI for a portable audio recording application which would
have a lot of widgets (100+), like audio peak-level meters, which would have to animate at the
screen refresh rate.

I also used to work at a trading firm where I was inspired by trading applications.
The design of HikoGUI should allow for all the numbers of a spreadsheet like application
to be updated at screen refresh rate.

The library is released under the [BSL-1.0 license](https://opensource.org/licenses/BSL-1.0),
which allows the library to be used in both open-source and proprietary applications.


Features
--------

### Retained-mode C++20 API

A `hi::gui_window` is a RAII object that creates a window, and when it gets destroyed
it will also remove the window.

The `hi::gui_window` in turn will own the `hi::widget` tree using `std::unique_ptr`.

C++20 co-routine tasks are perfect for creating the widgets and moving them into
the widget, then awaiting events from widgets and reacting to it. In the end
when the co-routine returns, the window owned by the co-routine will be
automatically destroyed.


### Animation and Performance




### A complete GUI


 - High level API for making desktop applications.
 - Modern C++20 library.
 - Retained-mode GUI.
 - GUI and event-loop co-routine support.
 - Widgets may be animated at the screen's refresh rate.
 - Multi-monitor and DPI scaling.
 - Themes; including light/dark support.
 - Editable key-bindings.
 - Most or all drawing is GPU accelerated with Vulkan.
 - Text is drawn using kerning, perceptional correct subpixel anti-aliasing.
 - High dynamic range and high gamut color handling.
 - Many support systems:
   + logging, counting, tracing,
   + constexpr Unicode algorithms, including bidirectional text,
   + text localization,

Examples
--------
In this example audio devices are dynamically tracked in the user-interface, even when the changes are happening during
device selection:

{% include figure.html url="/assets/images/screenshots/audio_device_change.gif" description="Audio Selection tracking devices in real time" %}

Localization changes are also handled dynamically, in this example you can see the language of the application change
when the language priority on the operating system has changed:

{% include figure.html url="/assets/images/screenshots/language_change.gif" description="Multiple language support" %}

HikoGUI's theme support includes dark/light sub-themes. Here you can see the theme change when the operating system
is switched between light and dark. The perceptional correct anti-aliasing will make sure that the weight of the
text remains the same between light and dark themes:

{% include figure.html url="/assets/images/screenshots/demo_dark_and_light.png" description="Themes with dark and light mode" %}

To improve legibility of text HikoGUI uses subpixel anti-aliasing. The glyph shader calculates the coverage of each sub-pixel
separately and the calculates a perceptional correct alpha value for each sub-pixel; this means no post processing filter is
necessary to reduce chromatic aberrations:

{% include figure.html url="/assets/images/screenshots/subpixel_glyphs.png" description="Subpixel anti-aliasing" %}


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

