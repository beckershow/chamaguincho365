'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

interface AnimationConfig {
  preview?: boolean;
  scale: number;
  speed: number;
}

interface NoiseConfig {
  opacity: number;
  scale: number;
}

interface EtherealShadowProps {
  sizing?: 'fill' | 'stretch';
  color?: string;
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  style?: CSSProperties;
  className?: string;
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number {
  if (fromLow === fromHigh) {
    return toLow;
  }
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
  const id = useId();
  const cleanId = id.replace(/:/g, '');
  const instanceId = `shadowoverlay-${cleanId}`;
  return instanceId;
};

export function EtherealShadow({
  sizing = 'fill',
  color = 'rgba(255, 129, 0, 1)',
  animation,
  noise,
  style,
  className,
}: EtherealShadowProps) {
  const id = useInstanceId();
  const animationEnabled = animation && animation.scale > 0;
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueRotateMotionValue = useMotionValue(180);
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

  const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
  const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

  useEffect(() => {
    if (feColorMatrixRef.current && animationEnabled) {
      if (hueRotateAnimation.current) {
        hueRotateAnimation.current.stop();
      }
      hueRotateMotionValue.set(0);
      hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
        duration: animationDuration / 25,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
        ease: 'linear',
        delay: 0,
        onUpdate: (value: number) => {
          if (feColorMatrixRef.current) {
            feColorMatrixRef.current.setAttribute('values', String(value));
          }
        },
      });

      return () => {
        if (hueRotateAnimation.current) {
          hueRotateAnimation.current.stop();
        }
      };
    }
  }, [animationEnabled, animationDuration, hueRotateMotionValue]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          filter: animationEnabled ? `url(#${id}-displacementFilter)` : undefined,
        }}
      >
        {animationEnabled && (
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id={`${id}-displacementFilter`} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="turbulence" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="turbulence"
                  scale={displacementScale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feColorMatrix ref={feColorMatrixRef} type="hueRotate" values="180" />
              </filter>
            </defs>
          </svg>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
            opacity: 0.4,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: sizing === 'fill' ? '100%' : 'auto',
            height: sizing === 'fill' ? '100%' : 'auto',
            objectFit: sizing === 'fill' ? 'cover' : 'fill',
            position: 'relative',
          }}
        >
          <span className="sr-only">Ethereal Shadow Background</span>
        </div>
      </div>

      {noise && noise.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${(noise.scale || 1) * 100}px ${(noise.scale || 1) * 100}px`,
            opacity: noise.opacity,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
