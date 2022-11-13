import {
  MouseEventHandler,
  useCallback,
  useState,
  StyleHTMLAttributes,
  useMemo,
} from "react";

const MINIMUM_RIPPLE_SIZE = 100;

export function Ripple() {
  const [handleClickRipple, ripples] = useRipple();
  return (
    <div className="absolute inset-0" onMouseDown={handleClickRipple}>
      {ripples}
    </div>
  );
}

interface RippleObject {
  key: number;
  style: StyleHTMLAttributes<HTMLDivElement>;
}

export function useRipple(
  style?: StyleHTMLAttributes<HTMLDivElement>
): [MouseEventHandler, JSX.Element[]] {
  const [ripples, setRipples] = useState<RippleObject[]>([]);

  const showRipple = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const { left, top } = (
        event.currentTarget as HTMLDivElement as HTMLDivElement
      ).getBoundingClientRect();
      const x = event.clientX - left;
      const y = event.clientY - top;
      const rippleSize = Math.min(
        (event.currentTarget as HTMLDivElement as HTMLDivElement).clientHeight,
        (event.currentTarget as HTMLDivElement as HTMLDivElement).clientWidth,
        MINIMUM_RIPPLE_SIZE
      );

      const newRipple = {
        key: event.timeStamp,
        style: {
          display: "block",
          width: rippleSize,
          height: rippleSize,
          position: "absolute",
          left: x - rippleSize / 2,
          top: y - rippleSize / 2,
          background: "currentColor",
          borderRadius: "50%",
          opacity: 0.4,
          pointerEvents: "none",
          animationDuration: "0.7s",
          ...(style || {}),
        },
      };

      setRipples((state) => [...state, newRipple]);
    },
    [style]
  );

  const ripplesArray = useMemo(
    () =>
      ripples.map((currentRipple) => {
        const handleAnimationEnd = () => {
          setRipples((state) =>
            state.filter(
              (previousRipple) => previousRipple.key !== currentRipple.key
            )
          );
        };

        return (
          <div
            className="ripple-item"
            {...currentRipple}
            onAnimationEnd={handleAnimationEnd}
          />
        );
      }),
    [ripples]
  );

  return [showRipple, ripplesArray];
}
