# reading.js

This project is an attempt to make it easier to read
documents---particularly long ones---online.

The two primary components are the `reading.js` script and the
`reading.css` stylesheet.  When these two are included in a
well-structured HTML file, they add a lot of cool functionality:

- **Keyboard shortcuts:** Navigate the document without using your
    mouse.

- **Section folding:** click on a section header to collapse the
    section.  You can also collapse every subsection within a section
    (either by clicking the "all" button or using one of the handy
    keyboard shortcuts).
    
- **Switch between color schemes:** Ethan Schoonover's
    [Solarized](http://ethanschoonover.com/solarized) themes make
    things easy on the eyes.  Hit `s` to switch between light and dark
    modes.
    
## Using reading.js

Feel free to download and modify this project to your heart's
content.  If you just want to plug the files into your own document,
though, simply add these two lines to the `<head>` of your HTML
document:

```html
<link rel="stylesheet" href="http://baruffio.com/read/stylesheets/style.css">
<script type="text/javascript" src="http://baruffio.com/read/js/scripts.js"></script>
```

I haven't tested any other `.css` file alongside `reading.css`.

## What do you mean by "well-structured HTML"?

I designed reading.js to use with the HTML documents that I have
generated with applications like
[pandoc](http://johnmacfarlane.net/pandoc/).  Every section of text is
preceded by a header element (`h1`, `h2`, `h3`, `h4`, `h5`, or `h6`),
and the header elements are direct children of the `<body>` (that is,
they are not enclosed in a `<div>` or any other element).  Reading.js
won't work if the header elements in your document are differently
formatted.  (If you're using pandoc, don't use the `--section-divs`
option.)

Obviously these limitations are just the result of my limitations as a
programmer.  The `range-method` branch of this project is an older
version of the script that hid content using JavaScript instead of
CSS.  That avoided some of the limitations just mentioned, but was
much slower.

## "License"

This software may be used for any purpose whatever, but with no
warranty or guarantee of any kind.
