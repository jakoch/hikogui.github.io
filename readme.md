
![HikoGUI: A modern, high-performance, retained-mode, gui library](/assets/images/logos/hikogui-logo-1000x280.png){:width="500px" height="140px"}

[Take Vos](https://github.com/takev/) started this library to make a portable,
high performance and modern looking GUI framework. Which may be used in
proprietary applications with the [BSL-1.0 license](https://opensource.org/licenses/BSL-1.0).

It is specifically designed to display dynamic information at the screen's
refresh rate. Special care is taken for making it easy for GUI element to
observe and modify data external to the GUI.

News: Release-0.7.0 Strange Squirrel
------------------------------------

To make it possible to select, interrogate and configure audio devices this release
is a start to make composable shared-state which in turn makes it possible
to make composable widgets. This allows a sub-`observer<>` to be created
from a member variable of an `observer<>`-ed value. This is loosely based
on the cursors and lenses from (lager)[https://sinusoid.es/lager/]'s
value oriented design.

I have also removed the reliance on `URL` from most of the API and use
`std::filesystem::path` instead. `URL` will implicitly convert to
`std::filesystem::path` in the same way that `std::filesystem::path` implicitly
converts to string types. The previous reliance on `URL` happened due
to the experimental implementation of `std::filesystem::path` when I
started on HikoGUI.

There are also a few other systems that have been updated:

 * Co-routines: awaiting on a timeout.
 * Simplified widget event handling.
 * The `color` type can hold a RGBA color value or be a enum value of a semantic color.
 * Handle HDR on platforms with uniform HDR/SDR (windows 10 doesn't).
 * Very fast 2 step index-array unicode character lookup.
 * New grapheme type uses 21-bits and can be used as char of std::basic\_string.
 * New user-extensible char-encoding conversion system.
 * std::format early static-type-check on `hi_log*()` macros.
 * Add `mode` enumeration to widgets to handle visibility, disabled, enabled.
 * Add a baselines to align text between widgets on the same row.
 * Rewritten `file` and `file_view` to function as copyable and movable value types.
 * Split build documentation between different IDEs. I would love to
   receive documentation for building with other IDEs than Visual Studio.


Features
--------

 - High level API for making desktop applications.
 - Modern C++20 library.
 - Retained-mode GUI.
 - GUI and event-loop co-routine support.
 - Widgets may be animated at the screen's refresh rate.
 - Multi-monitor and DPI scaling.
 - Themes; including light/dark support.
 - Editable key-bindings.
 - Most or all drawing is GPU accelerated with Vulkan.
 - Text is drawn using kerning, perceptional correct blending, subpixel anti-aliasing and rudimentary automatic hinting.
 - High dynamic range and high gamut color handling.
 - Many support systems:
   + logging,
   + statistics,
   + Unicode algorithms, including bidirectional text,
   + text localization,
   + text template language,
   + expression language,
   + dynamic type system.
   + preferences.

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

