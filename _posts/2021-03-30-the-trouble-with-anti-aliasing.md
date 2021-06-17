---
layout: default
title: The Trouble with Anti-Aliasing
---

{{page.title}}
==============
- by: Take Vos
- date: {{page.date | date_to_string}}

When I was working on the font rendering in ttauri I found an issue where
the text looked to have a different weight between the light and dark mode
of my application.

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-linear.png" description="'correct'&nbsp; anti-aliasing in linear-sRGB color space" %}

The rendering above was done inside the SDF (signed distance field)
fragment-shader completely in linear-RGB color space. And as you see
the weight of the text in light-mode is too thin, and the weight in dark-mode
is too bold. 

So why is this happening? According to many articles about font rendering this
is happening because we did the compositing in a gamma color space, we didn't;
and we should use linear color space, which we did.

Other articles talk about that fonts are designed to be black-on-white and you
should use stem-darkening. Which is weird because the stem darking is supposed to
be done on the, _already designed for_, black-on-white text.

So I decided to investigate what is really happening here, and in short I found that
when anti-aliasing our eyes expect a perceptional uniform gradient, which does not
happen when mixing the foreground and background color in a linear-RGB space.

Doing the calculation
---------------------
In this chapter I will show why a \\(1\\) pixel wide line will visual look
like a \\(1.46\\) pixel wide line after anti-aliasing in a linear-RGB color space.

For this example we will draw a one pixel wide vertical line with its center
at \\(x = 1.75\\). The line is white on a black background, which means that
the alpha of a pixel can be directly translated into linear luminance values.

But since our eyes do not perceive luminance values as linear we will need
to convert these values to lightness values using the formula from CIE L\*a\*b\* 1976.
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
linear luminance values and the perceptional uniform lightness values.
As you see our intended vertical line is \\(1\\) pixel wide. But after
we calculated what a human eye really perceives we find that the line is visually
\\(1.46\\) pixels wide.

 | Description  |          0 |          1 |          2 |          3 | width
 |:------------ | ----------:| ----------:| ----------:| ----------:|:--------------------------------
 | Alpha        | \\(0.00\\) | \\(0.25\\) | \\(0.75\\) | \\(0.00\\) | \\( 1.00 = 0.25 + 0.75 \\)
 | Luminance    | \\(0.00\\) | \\(0.25\\) | \\(0.75\\) | \\(0.00\\) |
 | Lightness    | \\(0.00\\) | \\(0.57\\) | \\(0.89\\) | \\(0.00\\) | \\( 1.46 = 0.57 + 0.89 \\)

Don't: anti-alias in the sRGB color space
-----------------------------------------
At this point you may think, okay... anti-alias instead in the sRGB color space.
The sRGB's transfer function (gamma), by design, already approximates the perceived lightness.

This will actually work, up to a point. Many font rendering engines do this, probably after
having experimented with linear anti-aliasing and not getting the desired results. And even
image editors used to compose in a similar non-linear color spaces in the past.

However instead of a uniform gradient between the foreground and the background the colors
may get seriously distorted. When using red on a green background for example the gradient
passes into dark brown colors as shown in the image below.

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-perceptional-compositing.png" description="left: compositing in the sRGB color space, right: compositing in linear-sRGB color space" %}

Do: anti-alias in tLUV color space
----------------------------------
So we can't blend in either a linear-RGB space, nor in a uniform-RGB space. What we would like is a color
space that allows us to blend the perceptional uniform lightness together with linear colors.

The CIE L\*a\*b\* color space has a perceptional uniform lightness in one axis and a separate
perceptional uniform color plane. The CIE L\*a\*b\* color space may be a valid color space
to do anti-aliasing in, but it is computational expensive. I could not
find a standard color space that was cheaper to use with similar properties so I made my own; the **tLUV**
color space, which is described in the next chapter.

When we try to use tLUV color space to anti-alias that same one pixel vertical line from the "_Doing the calculation_"
chapter, we get a visual line width of \\(1.1\\) which is a serious improvement compared to linear-RGB anti-aliasing
which resulted in a visual line width of \\(1.46\\).


 | Description  |          0 |          1   |          2   |          3 | width
 |:------------ | ----------:| ------------:| ------------:| ----------:|:--------------------------------
 | Alpha        | \\(0.00\\) | \\(0.25\\)   | \\(0.75\\)   | \\(0.00\\) | \\( 1.00 = 0.25 + 0.75 \\)
 | Luminance    | \\(0.00\\) | \\(0.0625\\) | \\(0.5625\\) | \\(0.00\\) |
 | Lightness    | \\(0.00\\) | \\(0.30\\)   | \\(0.80\\)   | \\(0.00\\) | \\( 1.1 = 0.3 + 0.8 \\)

Below is the result of using tLUV, as you can see the font weight seems to be equal between light and dark modes:

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-perceptional.png" description="anti-aliasing in the tLUV color space" %}

As a torture test we also used tLUV on red text on a green background, which shows a good color interpolation
between red and green without brown tints:

{% include figure.html url="/assets/images/posts/the-trouble-with-anti-aliasing-screenshot-perceptional-color.png" description="anti-aliasing in the tLUV color space: torture test" %}

The tYUV and tLUV color spaces
------------------------------
The tYUV color space consists of 3 elements: Y = linear-luminosity, U = blue projection,
V = red projection. Unlike most YUV format the U and V components are not scaled or offset
and therefor need to be kept in floating point format. The calculation between tYUV and
linear-RGB space requires only a few multiplication, add & subtract operations.

As an approximation for the conversion of luminance to lightness I am using a simple
square curve, which is simpler to calculate than the CIE L\*a\*b\* cubic curve.
However for anti-aliasing of fonts it seems the approximation is good enough.

linear-RGB to tYUV/tLUV:

$$
\begin{align*}
Y &= K_r \cdot R + K_g \cdot G + K_b \cdot B \\
L &= \sqrt(Y) \\
U &= B - Y\\
V &= R - Y
\end{align*}
$$

tYUV/tLUV to linear-RGB:

$$
\begin{align*}
Y &= L^2 \\
R &= V + Y\\
G &= Y - V \cdot K_v - U \cdot K_u\\
B &= U + Y
\end{align*}
$$

The constants used in the conversion are depended on the color-primaries of the
RGB color space, they describe the contribution of each color component to the white-point:

 | Name      |    sRGB/rec.709 |         rec.601 |
 |:--------- | ---------------:| ---------------:|
 | \\(K_r\\) | \\(0.2126\\)    | \\(0.299\\)     |
 | \\(K_g\\) | \\(0.7152\\)    | \\(0.587\\)     |
 | \\(K_b\\) | \\(0.0722\\)    | \\(0.114\\)     |
 | \\(K_u\\) | \\(K_b / K_g\\) | \\(K_b / K_g\\) |
 | \\(K_c\\) | \\(K_r / K_g\\) | \\(K_r / K_g\\) |

How to do this on Vulkan
------------------------
Vulkan's fixed pipeline alpha compositing does not have a mode for compositing
in tLUV color space. So compositing needs to be done in the fragment shader itself.

Vulkan has the possibility to use the output attachment from a previous sub-pass
as the input attachement for the current shader. An input attachment works a bit
like a texture map except that you can only read the pixel at the current fragment
coordinate. Input attachments are actually quite fast especially on tile based GPU
on mobile devices since the memory for the tile is located on the GPU-asic itself.

It seems that it is no longer possible to use the input attachment as an output attachment
at the same time, since the image must be in two different layouts at the same time. So
you will need to write to a new output attachment.

There must be a full-window post-process sub-pass which will combine the background with the
output of the text render pass which select pixels based on their non-zero alpha.

Terms
-----

### Linear-sRGB color space
Linear-sRGB is an inaccurate term describing a color space based on
the sRGB color primaries and white point, but with a linear transfer function.

The color component values have a range between \\(0.0\\) and \\(1.0\\) and are represented
as floating point values. In certain cases values outside the \\(0.0\\) to \\(1.0\\) range
are allowed to handle luminance values beyond \\(80 cd/m^2\\) for HDR, or negative values
which represent colors outside the triangle of the sRGB color primaries.

This is the color space that is used inside fragment shaders on a GPU.

### Luminance (Y)
The luminance is a physical linear indication of brightness.

In this paper we use the range of luminance values between \\(0.0\\) and \\(1.0\\) to
be mapped linear to \\(0 cd/m^2\\) to \\(80 cd/m^2\\); which is the standard range of
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

In this blog post we use the range of lightness values between \(0.0\\) and \\(1.0\\) to
be mapped non-linear to \\(0 cd/m^2\\) to \\(80 cd/m^2\\).  which is the standard range of
[sRGB](https://en.wikipedia.org/wiki/SRGB) screen-luminance-level.

The formula to convert luminance to CIE L\*a\*b\* lightness value is:

$$
f(t) =
\begin{cases}
    \sqrt[3]{t} & \text{if } t > ( \frac{6}{29} )^3
\\
    \frac{1}{3} ( \frac{29}{6} )^2 t + \frac{4}{29} & \text{otherwise}
\end{cases}
$$

$$ L = 1.16 f \left( \dfrac{Y}{Y_n} \right) - 0.16 $$

The formula below is an approximation made in 1920, which is much faster to calculate
in hardware.

$$ L = \sqrt{Y} $$

$$ Y = L * L $$

<https://en.wikipedia.org/wiki/Lightness>

