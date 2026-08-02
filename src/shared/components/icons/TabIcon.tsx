import React from 'react';
import Svg, {
  Circle,
  Path,
  Rect,
} from 'react-native-svg';

export type TabIconName =
  | 'overview'
  | 'incidents'
  | 'activity'
  | 'settings';

type TabIconProps = {
  name: TabIconName;
  color: string;
  size?: number;
};

export function TabIcon({
  name,
  color,
  size = 22,
}: TabIconProps) {
  const sharedProps = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.9,
  };

  return (
    <Svg
      accessibilityElementsHidden
      focusable={false}
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {name === 'overview' ? (
        <>
          <Rect
            {...sharedProps}
            height="7"
            rx="2"
            width="7"
            x="3"
            y="3"
          />
          <Rect
            {...sharedProps}
            height="11"
            rx="2"
            width="7"
            x="14"
            y="3"
          />
          <Rect
            {...sharedProps}
            height="7"
            rx="2"
            width="7"
            x="3"
            y="14"
          />
          <Rect
            {...sharedProps}
            height="3"
            rx="1.5"
            width="7"
            x="14"
            y="18"
          />
        </>
      ) : null}

      {name === 'incidents' ? (
        <>
          <Path
            {...sharedProps}
            d="M12 3 2.8 19a1.4 1.4 0 0 0 1.2 2h16a1.4 1.4 0 0 0 1.2-2L12 3Z"
          />
          <Path
            {...sharedProps}
            d="M12 9v4"
          />
          <Circle
            cx="12"
            cy="17"
            fill={color}
            r="1"
          />
        </>
      ) : null}

      {name === 'activity' ? (
        <>
          <Path
            {...sharedProps}
            d="M3 12h4l2.5-6 5 12 2.5-6H21"
          />
        </>
      ) : null}

      {name === 'settings' ? (
        <>
          <Circle
            {...sharedProps}
            cx="12"
            cy="12"
            r="3"
          />
          <Path
            {...sharedProps}
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
          />
        </>
      ) : null}
    </Svg>
  );
}