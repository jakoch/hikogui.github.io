Subpixel anti aliassing
=======================

Signed distance field
---------------------
Glyphs are rendered into a SDF (signed distance field). A SDF
is a texture-map that contains a distance value at each texel.
This distance value represents the distance from the center of that texel
to the nearest edge of the glyph, the sign represents if the texel is
inside or outside the glyph.

Distances can be bi-linear interpolated using the standard texture map
sampler in the fragment shader, this results in glyphs with nice smooth
edges with anti-aliassing.

Coverage of sub-pixels
----------------------
By sampling the SDF at the three different positions, once for each
sub-pixel we can retrieve a good coverage ratio for each sub-pixel.

Perceptional uniform anti-aliasing
----------------------------------
Anti-alias coverage is not like normal coverage it is a synthetic
construct to use the brightness of pixels to increase the preceived
resolution of line.

To convert the anti-alias coverage ratio (0.0 - 1.0) to an alpha we will
need to take to foreground- and background-colors convert both to
luminocity (linear) then to lightness (perceptual). Then mix the
forground- and background-lightness with the coverage
which will result in a target-lightness.

Then convert to target-luminocity
and figure out what the alpha value should be to mix foreground- and
background-luminocity to the target-luminocity.

If background- and foreground-luminocity are equal, then simply
use the coverage as the alpha value.

Since in simple fragment shaders you do not have access to the background
pixel values we use the foreground-lightness to guess the background-lightness:
 * When foreground-lightness > 0.6 then background-lightness = 0.0,
 * When foreground-lightness < 0.4 then background-lightness = 1.0,
 * Otherwise background-lightness = foreground-lightness (thus: alpha = coverage)
   Also turn off subpixel anti-aliasing and simply use the center coverage
   as full pixel alpha.



```
R    G    B
0.8  0.8  0.8  color
0.25 0.50 0.75 coverage



```










