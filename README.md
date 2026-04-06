AUREON

Precision Visualization for Visionary Architecture

Overview

AUREON is a high-end architectural visualization studio focused on delivering cinematic, photorealistic spatial narratives for global developers, architects, and design-driven brands.

This repository contains the codebase for the Aureon Digital Flagship Platform — a performance-optimized, CMS-driven, interactive portfolio designed to present architectural work with clarity, restraint, and premium execution.

The platform is engineered to handle:

High-resolution imagery
Cinematic video content
Scalable project datasets
Interactive UI elements
Future WebGL integrations
Core Objectives
Establish a global-standard digital presence
Deliver a cinematic, minimal, and architectural UI
Maintain high performance despite heavy media
Enable scalable content management via headless CMS
Provide a foundation for future expansion (team, projects, services)
Tech Stack
Frontend
Next.js (App Router)
React
Tailwind CSS
Framer Motion (animations)
next/image (image optimization)
Backend / CMS (Planned Integration)
Strapi (Headless CMS)
REST / GraphQL API
Deployment
Vercel (Global CDN)
Media Optimization
WebP (images)
H.265 MP4 (video)
Lazy loading + preloading strategies
Platform Architecture
/app
  /projects
    /[slug]
  /services
  /behind-the-scenes
  /contact

/components
/sections
/lib/api
/types
/styles
Features
1. Cinematic Landing Experience
Fullscreen video hero
Slow zoom animation
Gradient transitions
Minimal UI overlays
2. Dynamic Project System
CMS-driven project pages
Metadata:
Title
Description
Status (Design / In Progress / Completed)
Media galleries
Optimized loading and rendering
3. Services Architecture

Dedicated service pages:

ArchViz
Architectural Design
Modelling
Product Design & Visualization
Branding & Marketing

Includes structured content and media per service.

4. Behind The Scenes
Before/After comparisons
Half-rendered shots
Interactive sliders and slideshows
5. Contact System
Structured inquiry form
Callback request option
WhatsApp integration
Direct phone access
6. Gallery System
Filterable categories
Lightbox viewer
CMS-managed assets
Design System
Visual Language
Deep black base (#0A0A0A)
Subtle charcoal gradients
Controlled gold accents
Strong negative space
UI Principles
Minimal
Precise
Structured
Non-intrusive animations
No visual noise
Liquid Glass System

Applied selectively to:

Navigation
Buttons
Modals

Properties:

Backdrop blur
Low-opacity surfaces
Soft borders
Subtle highlights
Animation System
Framer Motion powered
Smooth cubic-bezier easing
No bounce or exaggerated motion
Scroll-triggered reveals
Subtle parallax effects
CMS Data Structure (Planned)
Projects
title
slug
shortDescription
detailedDescription
status
location
completionDate
heroMedia
galleryImages
Services
title
description
headerMedia
BehindTheScenes
beforeImage
afterImage
halfRenderedImage
ContactSubmissions
fullName
email
phone
company
projectType
message
callbackRequested
MediaLibrary
file
type
optimizedVersion
metadata
Performance Strategy
CDN delivery via Vercel
Lazy loading for all non-critical assets
Preloading hero media
Image optimization via next/image
Reduced runtime JS
Avoid heavy WebGL on landing pages
Maintain smooth 60fps interactions
Development Guidelines
Maintain strict component modularity
Keep UI minimal and intentional
Avoid unnecessary libraries
Optimize all assets before upload
Follow consistent naming conventions
Preserve architectural composition in layouts
Roadmap
 Strapi CMS integration
 Admin dashboard for content control
 WebGL project showcases (Three.js / Unreal embeds)
 Advanced filtering and search
 Multi-language support
 Client portal integration
Brand Philosophy

Aureon is built on:

Precision
Restraint
Spatial awareness
Material realism
Visual clarity

The platform must reflect these values in every interaction.

License

Private / Proprietary — All rights reserved.

Contact

Aureon Studio

Mobile: +2547-2775-0097
Mobile: +2541-1543-5031
Landline: 0202-345-678
Instagram: aureon.ast
TikTok: aureon.co
YouTube: @aureon.lin3ea

Aureon — Crafting Spatial Narratives Through Architecture, Light, and Form.
