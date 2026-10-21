# Kasteel Hulhuizen AR

Web app for Android Chrome. It shows the reconstructed buildings of Kasteel Hulhuizen
(castle, voorburcht, bridges, chapel, farmstead) through the phone camera, centred on the tree clump in the Millingerwaard.

- Castle centre: 51.8837564, 6.0123375 (the bosje, given by Gerico)
- Viewing spot on the dike: 51.8853158, 6.0032656
- From the dike to the castle: 646 m, bearing 106° (east-south-east)

## Files
- `index.html`: the app (camera, GPS, compass, calibration)
- `model.js`: the 3D buildings (sizes estimated; layout from the 17th-century maps in Overmars, *Een Waal Verhaal*, 2020, ch. 13)
- `three.min.js`: Three.js r128, included so the app does not depend on a CDN in the field

## Hosting
The camera and sensors only work over **https**. Any static host works (GitHub Pages, Netlify).
"Voorbeeld zonder camera" on the start screen shows the view from the dike on a computer.

## On site
1. Stand on the dike and look towards the bosje.
2. Tap Start AR and allow camera and location access.
3. If the castle is not on the bosje, aim the cross at the centre of the bosje and tap "Kasteel hier".
   The ◀ 1° / 1° ▶ buttons fine-tune it. Under Instellingen you can set camera height, field of view and transparency.
