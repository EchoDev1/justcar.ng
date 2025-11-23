# Animated Hero Section

A stunning, fully animated hero section with glassmorphism design, particle effects, and parallax scrolling.

## Features

### ✨ Animated Background Effects

1. **Particle System** - Floating light orbs (firefly effect) with:
   - 50 animated particles
   - Pulsing glow effects
   - Dynamic connections between nearby particles
   - Smooth movement with edge bouncing

2. **Grid Pattern** - Subtle glowing grid with:
   - Dual-layer grid (50px and 200px)
   - Pulsing glow animation
   - Electric blue (#00D9FF) accent color

3. **Gradient Mesh** - Moving gradient background with:
   - Three radial gradients (blue, orange, green)
   - 20-second smooth animation
   - Parallax movement on scroll

4. **Parallax Effect** - Multi-layer scrolling with:
   - Background moves slower than content
   - Grid and particles have different scroll speeds
   - Creates depth and immersion

5. **Video Background (Optional)** - Support for:
   - Muted, auto-playing video loop
   - Luxury car footage or any video
   - Overlay gradient for readability

### 🎨 Design Elements

- **Glassmorphism cards** for search bar and stats
- **Gradient animated text** for the main title
- **Smooth micro-interactions** on all interactive elements
- **Responsive design** for mobile, tablet, and desktop
- **Accessibility** with proper focus states

## Usage

### Basic Usage

```jsx
import AnimatedHero from '@/components/hero/AnimatedHero'

<AnimatedHero
  title="Find Your Dream Car in Nigeria"
  subtitle="Browse verified cars from trusted dealers"
/>
```

### With Video Background

```jsx
<AnimatedHero
  enableVideo={true}
  videoSrc="/videos/luxury-cars.mp4"
  title="Your Dream Car Awaits"
  subtitle="Premium selection of verified vehicles"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableVideo` | boolean | `false` | Enable video background |
| `videoSrc` | string | `null` | Path to video file (MP4 recommended) |
| `title` | string | "Find Your Dream..." | Main heading text |
| `subtitle` | string | "Browse verified..." | Subtitle text |

## Customization

### Particle Count

Edit line 20 in `AnimatedHero.js`:

```javascript
const particleCount = 50 // Increase for more particles
```

### Particle Colors

Edit the gradient color in the animation loop (line 77):

```javascript
gradient.addColorStop(0, `rgba(0, 217, 255, ${currentOpacity})`) // Change RGB values
```

### Grid Spacing

Edit the grid background size (line 170):

```javascript
backgroundSize: '50px 50px' // Adjust grid cell size
```

### Animation Speed

Modify the animation duration in styles:

```javascript
animation: 'mesh-move 20s ease-in-out infinite' // Change 20s
```

## Video Background Setup

### Recommended Video Specs

- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) or 3840x2160 (4K)
- **Duration**: 10-30 seconds (looped)
- **Size**: Keep under 5MB for fast loading
- **Content**: Luxury cars in motion, car showroom, etc.

### Free Video Sources

- **Pexels**: https://www.pexels.com/videos/cars/
- **Pixabay**: https://pixabay.com/videos/search/luxury%20cars/
- **Coverr**: https://coverr.co/s/car

### Adding Your Video

1. Place your video file in `/public/videos/`
2. Enable video in the component:

```jsx
<AnimatedHero
  enableVideo={true}
  videoSrc="/videos/your-video.mp4"
/>
```

## Performance Optimization

### Tips for Smooth Animation

1. **Reduce particle count** on mobile devices
2. **Compress video files** using HandBrake or similar
3. **Use lazy loading** for below-the-fold content
4. **Enable hardware acceleration** (already implemented via CSS transforms)

### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

The hero section includes:

- Proper heading hierarchy (h1)
- Focus states for interactive elements
- Keyboard navigation support
- Screen reader compatible
- Reduced motion support (can be added)

### Adding Reduced Motion Support

Add to your CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .particle-canvas,
  .animate-float,
  .gradient-text-animated {
    animation: none;
  }
}
```

## Troubleshooting

### Particles Not Showing

- Check if canvas element is rendering
- Verify browser supports Canvas API
- Check console for JavaScript errors

### Video Not Playing

- Ensure video path is correct
- Video must be in MP4 format
- Check browser autoplay policies
- Video must be muted for autoplay

### Performance Issues

- Reduce particle count
- Compress/reduce video quality
- Disable video on mobile
- Use `will-change` CSS property sparingly

## Examples

### E-commerce Variant

```jsx
<AnimatedHero
  title="Premium Auto Marketplace"
  subtitle="Discover luxury vehicles from verified dealers"
/>
```

### Dealership Variant

```jsx
<AnimatedHero
  enableVideo={true}
  videoSrc="/videos/showroom.mp4"
  title="Welcome to AutoHub Nigeria"
  subtitle="Where dreams meet the road"
/>
```

## Credits

Built with:
- React/Next.js
- HTML5 Canvas API
- CSS3 Animations
- Tailwind CSS v4
- Lucide React Icons
