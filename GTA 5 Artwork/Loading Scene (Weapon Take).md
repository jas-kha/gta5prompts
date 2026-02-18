# ( Weapon ) GTA V Loading Screen Artwork Generation

## Overview

This document contains the prompt engineering workflow and results for generating a Grand Theft Auto V loading screen artwork using AI image generation tools.

## Primary Generation Prompt

### Gemini Nano Prompt

```markdown
Use the provided photo as the exact face reference and preserve the same identity and facial features.

Turn this photo into a realistic Grand Theft Auto V in-game artwork style.
Waist-up framing only, cropped at the waist, no legs visible.

Place the character slightly on the left side of the frame,
holding a weapon resting naturally on the right shoulder,
confident calm expression, natural relaxed pose, not stiff.

Cinematic Rockstar game lighting, smooth stylized shading,
realistic 3D in-game character textures, vibrant Los Santos street background blur,
official GTA V loading screen composition.

Keep the face likeness very accurate and do not change identity.
```

<h3>Paste Prompt turn on Nano Banana and turn on Thinking mode</h3>
<div align="center">
<img src="images/gemini.png" alt="Reference Photo" width="400px"/>
</div>

### Initial Result

The first generation produced a GTA V loading screen artwork that captures the character's likeness while maintaining the distinctive game aesthetic.

<!-- ![GTA V Loading Scene - Initial Generation](images/unnamed%20(2).jpg) -->

<div align="center">
<img src="images/takeWeapon/takeWeapon.png" alt="GTA V Loading Scene - Initial Generation" width="200px"/>
</div>

## Resolution Enhancement

### Follow-up Prompt (ChatGPT Image Generation)

<h4> Paste the generated nano image into ChatGPT and turn on image generation, then pasto the following prompt to enhance the resolution </h4>
<div align="center">
<img src="images/chatgpt.png" alt="ChatGPT Image Generation" width="400px"/>
</div>

To improve the image quality and resolution for better display purposes:

```markdown
do it 1920x1080
```

### Enhanced Result

The resolution enhancement resulted in a high-definition version of the loading screen artwork, optimized for 1080p displays.

![GTA V Loading Scene - 1920x1080 Enhanced](images/takeWeapon/takeWeapon%201920x1080.png)

## Technical Specifications

- **Original Resolution**: Standard quality
- **Enhanced Resolution**: 1920x1080 (Full HD)
- **Style**: Grand Theft Auto V in-game artwork
- **Framing**: Waist-up composition
- **Lighting**: Cinematic Rockstar game lighting
- **Background**: Vibrant Los Santos street blur

## Generation Tools Used

1. **Gemini Nano** - Primary image generation
2. **ChatGPT Image Generation** - Resolution enhancement

## Notes

- The character's facial features and identity are preserved throughout the generation process
- The artwork maintains the distinctive GTA V loading screen composition and aesthetic
- Both standard and high-resolution versions are available for different use cases
