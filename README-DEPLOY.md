# Deploy fix-my-speaker.net on Vercel

This folder is designed to work as its own standalone static website.

## Recommended Vercel settings

- Framework Preset: Other
- Root Directory: this folder itself
- Build Command: leave empty
- Output Directory: leave empty

## Important

Deploy this folder as its own repository root or set this folder as the Vercel project root.

Do not deploy the parent workspace if you want https://fix-my-speaker.net/ to open this site directly.

## Main files

- index.html
- styles.css
- script.js
- robots.txt
- sitemap.xml
- vercel.json

## Routing

This site uses folder-based pages such as:

- /about-us/
- /contact-us/

The homepage is served from /.

Supporting content pages also use folder routes, for example:

- /privacy-policy/
- /terms-and-conditions/

If you import this folder alone into Vercel, the homepage should resolve from index.html and subpages should resolve from their own index.html files inside each page folder.
