---
layout: default
title: The Trouble with Anti-Aliasing
---

The Trouble with Anti-Aliasing
==============================
by: Take Vos

When I was working on the font rendering in ttauri I found an issue where
the text looked to have a different weight between the light and dark mode
of my application.

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-linear.png" description="'correct'&nbsp; linear anti-aliasing" %}

The rendering above was done in a SDF (signed distance field) fragement-shader completely
in linear space. And as you see the weight of the text in light-mode is too thin,
and the weight in dark-mode is too bold. 

So why is this happening? According to many articles about font rendering this
is happening because we did the compositing in gamma space, we didn't, and we should
use linear space; which we did.

Other articles talk about that fonts are designed to be black-on-white and you
should use stem-darkening. Which is weird because the stem darking is supposed to
be done on the, _already designed for_, black-on-white text.

So I decided to investigate what is really happening here, and in short I found that
our eyes expect a perceptional uniform gradient, which linear compositing
does not give us.


Doing the calculation
---------------------
In this chapter I will show why a \\(1\\) pixel wide line will visual look
like a \\(1.46\\) pixel wide line after anti-aliasing using linear compositing.

For this example we will draw a pixel wide vertical line with its center
at \\(x = 1.75\\). The line is white on a black background, which means that
the alpha of a pixel can be directly translated into linear luminance values.

But since our eyes do not preceive luminance values as linear we will need
to convert these values to lightnes values using the formula from CIELAB 1976.
I filled in \\(Y_n = 1.0\\) into the formula and normalized \\(L\\) between \\(0.0\\)
and \\(1.0\\) to make it easier to work with:

$$
L =
\begin{cases}
    1.16 \cdot \sqrt[3]{Y} - 0.16 & \text{if } Y > 0.00885\\
\\
    9.03297 \cdot Y & \text{otherwise}
\end{cases}
$$

In the table below you can see a horizontal strip of 4 pixels, with the
linear luminance values and the calculated lightness values. As you see our intended
vertical line is \\(1\\) pixel wide. But after conversion to perceived lightness the line
has become \\(1.46\\) pixels wide.


 | Description  |          0 |          1 |          2 |          3 | width
 |:------------ | ----------:| ----------:| ----------:| ----------:|:--------------------------------
 | Alpha        | \\(0.00\\) | \\(0.25\\) | \\(0.75\\) | \\(0.00\\) | \\( 1.00 = 0.25 + 0.75 \\)
 | Luminance    | \\(0.00\\) | \\(0.25\\) | \\(0.75\\) | \\(0.00\\) |
 | Lightness    | \\(0.00\\) | \\(0.57\\) | \\(0.89\\) | \\(0.00\\) | \\( 1.46 = 0.57 + 0.89 \\)

Don't: Compose in sRGB color space
----------------------------------
At this point you may think, okay, composit in sRGB space. The gamma transfer
function used for sRGB approximates the preceived lightness.

This will actually work, up to a point. Many font rendering engines do this, probably after
experimenting with linear compositing and not getting the desired results. And even
image editors composited in a simular non-linear color space in the past.

However instead of a uniform gradient between the foreground and the background the colors
may be seriously distored. When using red on a green background for example the gradient
passes into dark brown colors as shown in the image below.

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-perceptional-compositing.png" description="left: sRGB compositing, right: linear compositing" %}

Do: Compose in Luv color space
------------------------------
In the Luv color space the L element represents lightness and is perceptional uniform and the
u and v elements are based on the blue and red components. This means that mixing two Luv-color
values will mix both the lightness and color perceptionally uniform.

The most accurate Luv color space would probably be CIE L*a*b* but this may be computationally
to expensive. An simpler approximation based on linear-sRGB and using a square instead of a cube
curve for lightness.

RGB to Luv:

$$
\begin{align*}
&Y = K_r \cdot R + K_g \cdot G + K_b \cdot B \\
&L = \sqrt{Y},\, u = B - Y,\, v = R - Y
\end{align*}
$$

Luv to RGB:

$$
\begin{align*}
&Y = L^2\\
&R = v + Y\\
&G = Y - v \cdot K_v - u \cdot K_u\\
&B = u + Y
\end{align*}
$$

Using the constants:

$$
\begin{align*}
&K_r = 0.2126,\, K_g = 0.7152,\, K_b = 0.0722\\
&K_u = \frac{K_b}{K_g},\, K_v = \frac{K_r}{K_g}
\end{align*}
$$

When we try to use Luv to draw that same one pixel vertical line from two chapter up. Using the
Luv compositing we get a line width of \\(1.1\\) vs. \\(1.46\\) of linear compositing:


 | Description  |          0 |          1   |          2   |          3 | width
 |:------------ | ----------:| ------------:| ------------:| ----------:|:--------------------------------
 | Alpha        | \\(0.00\\) | \\(0.25\\)   | \\(0.75\\)   | \\(0.00\\) | \\( 1.00 = 0.25 + 0.75 \\)
 | Luminance    | \\(0.00\\) | \\(0.0625\\) | \\(0.5625\\) | \\(0.00\\) |
 | Lightness    | \\(0.00\\) | \\(0.30\\)   | \\(0.80\\)   | \\(0.00\\) | \\( 1.1 = 0.3 + 0.8 \\)

Below is the result of using Luv, as you can see the font weight seems to be equal between the
the light and dark modes:

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-perceptional.png" description="Luv anti-aliasing" %}

And the result of when using red text over green background, which shows no color distortion:

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-perceptional-color.png" description="Luv anti-aliasing torture test" %}

Subpixel anti-aliasing
----------------------
{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-subpixel.png" description="horizontal-RGB subpixel anti-aliasing" %}


Terms
-----

### Linear-sRGB color space

Linear-sRGB is an inaccurate term describing a color space based on
the sRGB color primaries and white point, but with a linear transfer function.

The color component values have a range between 0.0 and 1.0 and are represented
as floating point values. In certain cases values outside the 0.0 to 1.0 range
are allowed to handle luminance values beyond 80 cm/m2 for HDR, or negative values
which represent colors outside the triangle of the sRGB color primaries.

This is the color space that is used inside fragment shaders on a GPU.

### Luminance (Y)

The luminance is a physical linear indication of brightness.

In this paper we use the range of luminance values between 0.0 and 1.0 to
be mapped linear to 0 cd/m2 to 80 cd/m2; which is the standard range of
sRGB screen-luminance-level.

The luminance value is calculated from the linear-sRGB values as follows:

$$ Y = 0.2126 * R + 0.7152 * G + 0.0722 * B $$

My intuition of luminance calculations in high-gamut extended-sRGB color space
is that the luminance is always positive. Since if a color outside the standard-sRGB
triangle is selected at least one of the components must be a positive enough
value to force the luminance to be above zero. Having only positive values is important
for taking the square root, see the next section.

<https://en.wikipedia.org/wiki/Relative_luminance>

### Lightness (L)

Lightness is the perceptual uniform indication of brightness.

In this paper we use the range of lightness values between 0.0 and 1.0 to
be mapped non-linear to 0 cd/m2 to 80 cd/m2.  which is the standard range of
[sRGB](https://en.wikipedia.org/wiki/SRGB) screen-luminance-level.

$$
f(t) =
\begin{cases}
    \sqrt[3]{t} & \text{if } t > ( \frac{6}{29} )^3
\\
    \frac{1}{3} ( \frac{29}{6} )^2 t + \frac{4}{29} & \text{otherwise}
\end{cases}
$$

$$ L^* = 116 f \left( \dfrac{Y}{Y_n} \right) - 16 $$

The lightness and luminance value can be translated as follows:

$$ L = \sqrt{Y} $$

$$ Y = L * L $$

The formula above is an approximation made in 1920, the current well accepted
approximation is closer to cube-root curve with a linear section for dark values used
in the 1976's CIELAB color space. However the square-root curve is accurate enough
for the use-case of anti-aliasing glyphs and is much faster in hardware and easier to
use when doing the calculations for this paper.

<https://en.wikipedia.org/wiki/Lightness>


The solution
------------

There are some papers that mention the problem of the change of apparent thickness
of glyphs when rendering black text or white text. Most of those papers go on
to explain this stems from not doing linear compositing, or explaining that the font
was designed for black on white.

However, as you see from the calculations in the previous section this has nothing to
do with the design of a font, because it shows up even when rendering a single line.
Also, if you would render the font without anti-aliasing these problems no longer
exist, such as when rendering with a high resolution printer.

Problems like this even happen with physical anti-alias filters, such as when using
an anti-alias glass in front of an image sensor, which scatter the photons over range
of pixels. It often shows as a reduction of contrast of textured images and on sharp edges,
normally this is solved by increasing the contrast of high frequency content, such
as using a sharpen-filter, or with professional cameras using an equalizer tuned on
the whole optical system.

Since with computer graphics we have control over anti-aliasing itself
we can make the algorithm mix the foreground and background color on a
perceptional uniform gradient.

The calculation below shows how to convert an anti-alias-pixel-coverage value
to an alpha value, when this pixel coverage is in a perceptional uniform space.

First we need to calculate the foreground and background lightness, based on the
final composite of the foreground and background color using the two alpha values
0.0 and 1.0. This definition will allow for semi-transparent foreground colors.

$$ Y_\text{front} = 0.2126 * R_\text{front} + 0.7152 * G_\text{front} + 0.0722 * B_\text{front} $$

$$ Y_\text{back}  = 0.2126 * R_\text{back} + 0.7152 * G_\text{back} + 0.0722 * B_\text{back} $$

$$ L_\text{front} = \sqrt{Y_\text{front} } $$

$$ L_\text{back}  = \sqrt{Y_\text{back} } $$

By mixing the foreground and background lightness using the coverage value, we
now have the target lightness for that coverage (C) value.

$$ L_\text{target} = \text{mix}(L_\text{back}, L_\text{front}, C) $$

We can convert this target lightness to a target luminance, which can then be used to find
the alpha value needed to reach that target from the foreground and background luminance.
If the luminance of the background and foreground are the same, then only the color is
different and we can linearly map the coverage to alpha.

$$ Y_\text{target} = L_\text{target} * L_\text{target} $$

$$
A =
\begin{cases}
    \dfrac{Y_\text{target} - Y_\text{back} }{Y_\text{front} - Y_\text{back} } & \text{if } Y_\text{front} \ne Y_\text{back}\\
    \\
    C & \text{otherwise}
\end{cases}
$$

### Example

Below we calculate what we will perceptional see when anti-aliasing a vertical
line of two pixels wide centered at x=2.25. On the left side a white line
on black background and on the right side the black line on a white background.

```
           white on black-background    black on white-background
          +----+----+----+----+----+   +----+----+----+----+----+
coverage  | 0% |25% |100%|75% | 0% |   | 0% |25% |100%|75% | 0% |
          +----+----+----+----+----+   +----+----+----+----+----+
                                        ((1 - coverage)^2 - 1) / -1
          +----+----+----+----+----+   +----+----+----+----+----+
alpha     |0.0 |.062|1.0 |.562|0.0 |   |0.0 |.438|1.0 |.938|0.0 |
          +----+----+----+----+----+   +----+----+----+----+----+
                                        1 - alpha
          +----+----+----+----+----+   +----+----+----+----+----+
luminance |0.0 |.062|1.0 |.562|0.0 |   |1.0 |.562|0.0 |.062|1.0 |
          +----+----+----+----+----+   +----+----+----+----+----+
                                        sqrt(luminance)
          +----+----+----+----+----+   +----+----+----+----+----+
lightness |0.0 |0.25|1.0 |0.75|0.0 |   |1.0 |0.75|0.0 |0.25|1.0 |
          +----+----+----+----+----+   +----+----+----+----+----+
```

The perceived line width of "white on black-background" is:

$$ \text{width} = 0.0 + 0.25 + 1.0 + 0.75 + 0.0 = 2 $$

The perceived line width of "black on white-background" is:

$$ \text{width} = 5 - (1.0 + 0.75 + 0.0 + 0.25 + 1.0) = 2 $$

Sub-pixel anti-aliasing
-----------------------

During sub-pixel anti-aliasing we get a coverage value at each
sub-pixel location.

For a perceptional conversion of those coverage value to an alpha
value we are interested in the lightness of the full pixel after
compositing with the two alpha values of 0.0 and 1.0.

After that we have an alpha value for each sub-pixel, then we do
linear compositing on each sub-pixel separate.

