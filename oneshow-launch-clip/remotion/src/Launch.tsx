// One Show launch clip, Remotion build. Every number comes from ../../shared/spec.json (the brief as
// numbers); this file only turns frames into pixels. Event frames: an event frame is the first frame
// that shows the change, so a tween that begins at event e starts at e - 1 (spec.convention).
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARCHIVO, MONO } from "./fonts";
import spec from "../../shared/spec.json";

const E = spec.events;
const C = spec.copy;
const P = spec.palette;
const L = spec.layout;

// Eases by name, the same curves GSAP uses in the HyperFrames build:
// expo.out = 1 - 2^(-10p), power4.out = 1 - (1-p)^5, power3.out = 1 - (1-p)^4, power1.out = 1 - (1-p)^2.
const expoOut = Easing.out(Easing.exp);
const quintOut = Easing.out(Easing.poly(5));
const quartOut = Easing.out(Easing.poly(4));
const quadOut = Easing.out(Easing.poly(2));
const backOut = (s: number) => Easing.out(Easing.back(s));
const linear = Easing.linear;
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// A ticket outline notched at the perforation, top and bottom (the explainer's ticketPath).
const ticketPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  px: number,
  r: number,
) =>
  `M${x},${y} H${px - r} A${r} ${r} 0 0 0 ${px + r},${y} H${x + w} V${y + h} H${px + r} A${r} ${r} 0 0 0 ${px - r},${y + h} H${x} Z`;

const PRESSED = "#BC311C"; // the accent darkened 6% toward the ink: the hover state

type DebugProps = { debug: boolean };

// ---- the headline ------------------------------------------------------------------------------
const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      id="headline"
      style={{
        position: "absolute",
        left: L.headline.x,
        top: L.headline.y,
        width: L.headline.w,
        height: L.headline.h,
        lineHeight: `${L.headline.h}px`,
        textAlign: "center",
        fontFamily: ARCHIVO,
        fontWeight: 800,
        fontSize: 56,
        letterSpacing: "-0.01em",
        color: P.ink,
        whiteSpace: "nowrap",
        opacity: interpolate(frame, [0, E.headline_in], [0, 1], {
          easing: expoOut,
          ...clamp,
        }),
        translate: `0px ${interpolate(frame, [0, E.headline_in], [16, 0], { easing: expoOut, ...clamp })}px`,
      }}
    >
      {C.headline}
    </div>
  );
};

// ---- the One Show screen: a card with the tour list, two fields and the button ------------------
const MiniTicket: React.FC<{ text: string; top: number; isNew?: boolean }> = ({
  text,
  top,
  isNew,
}) => {
  const frame = useCurrentFrame();
  // the new show files itself into the list at 300 (round 1): opacity and a 12 px rise, expo out
  const f0 = E.list_new - 1;
  const f1 = E.list_new_settled - 1;
  const entrance = isNew
    ? {
        opacity: interpolate(frame, [f0, f1], [0, 1], {
          easing: expoOut,
          ...clamp,
        }),
        translate: `0px ${interpolate(frame, [f0, f1], [12, 0], { easing: expoOut, ...clamp })}px`,
      }
    : {};
  if (isNew && frame < E.list_new) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: L.list.x - L.card.x,
        top,
        width: L.list.w,
        height: L.list.h,
        ...entrance,
      }}
    >
      <svg
        width={L.list.w}
        height={L.list.h}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <path
          d={ticketPath(0.5, 0.5, L.list.w - 1, L.list.h - 1, 230, 6)}
          fill={P.paper}
          stroke={isNew ? P.accent : P.line}
          strokeWidth={isNew ? 1.6 : 1.2}
        />
        <path
          d={`M230,12 V${L.list.h - 12}`}
          fill="none"
          stroke={P.line}
          strokeWidth={1.2}
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 0,
          width: L.listInner,
          height: L.list.h,
          lineHeight: `${L.list.h}px`,
          fontFamily: MONO,
          fontSize: 16,
          color: P.ink,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// the empty slot where the stub will land (round 1): a dashed ticket outline, gone as the stub grows
const Slot: React.FC = () => {
  const frame = useCurrentFrame();
  const S = L.slot;
  if (frame >= E.slot_gone) return null;
  return (
    <svg
      width={S.w}
      height={S.h}
      style={{
        position: "absolute",
        left: S.x - L.card.x,
        top: S.y - L.card.y,
        overflow: "visible",
        opacity: interpolate(
          frame,
          [E.stub - 1, E.slot_gone - 1],
          [1, 0],
          clamp,
        ),
      }}
    >
      <path
        d={ticketPath(1, 1, S.w - 2, S.h - 2, S.perf - S.x, S.r)}
        fill="none"
        stroke={P.line}
        strokeWidth={1.2}
        strokeDasharray="6 6"
        opacity={0.7}
      />
      <text
        x={S.w / 2}
        y={S.labelBaseline - S.y}
        textAnchor="middle"
        fontFamily={ARCHIVO}
        fontWeight={600}
        fontSize={13}
        letterSpacing="0.16em"
        fill={P.label}
        opacity={0.8}
      >
        {C.slotLabel}
      </text>
    </svg>
  );
};

type FieldProps = {
  label: string;
  value: string;
  box: { x: number; y: number; w: number; h: number };
  typeStart: number;
  perChar: number;
  focusFrom: number;
  focusTo: number;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  box,
  typeStart,
  perChar,
  focusFrom,
  focusTo,
}) => {
  const frame = useCurrentFrame();
  const shown =
    frame < typeStart
      ? 0
      : Math.min(value.length, Math.floor((frame - typeStart) / perChar) + 1);
  const focused = frame >= focusFrom && frame < focusTo;
  const caretOn = focused && Math.floor((frame - focusFrom) / 15) % 2 === 0;
  // the form clears after the press (release settled at 212, six frames)
  const cleared = interpolate(
    frame,
    [E.release_settled, E.release_settled + 6],
    [1, 0],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: box.x - L.card.x,
        top: box.y - L.card.y,
        width: box.w,
        height: box.h,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -24,
          fontFamily: ARCHIVO,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: P.label,
          lineHeight: "13px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background: P.paper,
          boxSizing: "border-box",
          border: `${focused ? 2 : 1.6}px solid ${focused ? P.accent : P.line}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 0,
          width: L.fieldInner,
          height: box.h,
          lineHeight: `${box.h}px`,
          fontFamily: MONO,
          fontSize: 20,
          color: P.ink,
          whiteSpace: "pre",
          opacity: cleared,
        }}
      >
        {value.slice(0, shown)}
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 24,
            background: P.ink,
            verticalAlign: "-5px",
            marginLeft: 1,
            opacity: caretOn ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

const Button: React.FC = () => {
  const frame = useCurrentFrame();
  const hover = interpolate(frame, [E.hover - 1, E.hover + 2], [0, 1], clamp);
  return (
    <div
      id="button"
      style={{
        position: "absolute",
        left: L.button.x - L.card.x,
        top: L.button.y - L.card.y,
        width: L.button.w,
        height: L.button.h,
        lineHeight: `${L.button.h}px`,
        borderRadius: L.button.rx,
        textAlign: "center",
        fontFamily: ARCHIVO,
        fontWeight: 600,
        fontSize: 24,
        color: P.paper,
        background: interpolateColors(hover, [0, 1], [P.accent, PRESSED]),
        transformOrigin: "50% 50%",
        // press: linear down over 3 frames, back.out(1.6) release over 14; adjacent so the state carries
        scale: String(
          interpolate(
            frame,
            [E.press - 1, E.release - 1, E.release_settled - 1],
            [1, 0.94, 1],
            {
              easing: [linear, backOut(1.6)],
              ...clamp,
            },
          ),
        ),
      }}
    >
      {C.button}
    </div>
  );
};

const Card: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // damping ratio 0.85 at 2 Hz: stiffness = (2 pi 2)^2 = 158, damping = 2 x 0.85 x sqrt(158) = 21.4
  const settle = spring({
    frame: frame - 12,
    fps,
    config: { stiffness: 158, damping: 21.4, mass: 1 },
  });
  return (
    <div
      id="card"
      style={{
        position: "absolute",
        left: L.card.x,
        top: L.card.y,
        width: L.card.w,
        height: L.card.h,
        borderRadius: L.card.rx,
        background: P.card,
        boxSizing: "border-box",
        border: `1.6px solid ${P.line}`,
        transformOrigin: "50% 50%",
        scale: String(0.96 + 0.04 * settle),
        opacity: Math.min(1, settle),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: L.card.titleBar - 1,
          height: 1,
          background: P.line,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 0,
          height: L.card.titleBar,
          lineHeight: `${L.card.titleBar}px`,
          fontFamily: ARCHIVO,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: P.label,
        }}
      >
        {C.cardTitle}
      </div>
      {C.list.map((t, i) => (
        <MiniTicket
          key={t}
          text={t}
          top={L.list.y - L.card.y + i * L.list.step}
        />
      ))}
      <MiniTicket
        text={C.listNew}
        top={L.list.y - L.card.y + 3 * L.list.step}
        isNew
      />
      <Slot />
      <Field
        label={C.dateLabel}
        value={C.dateValue}
        box={L.dateField}
        typeStart={E.type_date_start}
        perChar={4}
        focusFrom={E.click_date}
        focusTo={E.click_venue}
      />
      <Field
        label={C.venueLabel}
        value={C.venueValue}
        box={L.venueField}
        typeStart={E.type_venue_start}
        perChar={2}
        focusFrom={E.click_venue}
        focusTo={E.press}
      />
      <Button />
    </div>
  );
};

// one ring from the click point, after the press
const Ripple: React.FC = () => {
  const frame = useCurrentFrame();
  const f0 = E.ripple_start - 1;
  const f1 = E.ripple_end - 1;
  if (frame < E.ripple_start || frame > f1) return null;
  const cx = L.button.x + L.button.w / 2 + L.cursor.buttonOffset[0];
  const cy = L.button.y + L.button.h / 2 + L.cursor.buttonOffset[1];
  return (
    <svg
      width={1080}
      height={1080}
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={interpolate(frame, [f0, f1], [16, 64], {
          easing: quadOut,
          ...clamp,
        })}
        fill="none"
        stroke={P.accent}
        strokeWidth={2}
        opacity={interpolate(frame, [f0, f1], [1, 0], {
          easing: quadOut,
          ...clamp,
        })}
      />
    </svg>
  );
};

// the ticket stub: grows out of the button, then its five lines come in two frames apart
const Stub: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < E.stub) return null;
  const f0 = E.stub - 1;
  const S = L.stub;
  const lx = S.leftColumn.x - S.x;
  const rx = S.rightColumn.x - S.x;
  const line = (i: number) =>
    interpolate(
      frame,
      [E.stub_readable - 19 + i * 2, E.stub_readable - 11 + i * 2],
      [0, 1],
      { easing: quadOut, ...clamp },
    );
  return (
    <svg
      id="stub"
      width={S.w}
      height={S.h}
      style={{
        position: "absolute",
        left: S.x,
        top: S.y,
        overflow: "visible",
        transformOrigin: `${L.button.x + L.button.w / 2 - S.x}px ${L.button.y + L.button.h / 2 - S.y}px`,
        scale: String(
          interpolate(frame, [f0, E.stub_settled - 1], [0.6, 1], {
            easing: quartOut,
            ...clamp,
          }),
        ),
        translate: `0px ${interpolate(frame, [f0, E.stub_settled - 1], [24, 0], { easing: quartOut, ...clamp })}px`,
        opacity: interpolate(frame, [f0, f0 + 8], [0, 1], {
          easing: quadOut,
          ...clamp,
        }),
      }}
    >
      <path
        d={ticketPath(1, 1, S.w - 2, S.h - 2, S.perf - S.x, S.r)}
        fill={P.card}
        stroke={P.line}
        strokeWidth={2}
      />
      <path
        d={`M${S.perf - S.x},${S.r + 10} V${S.h - S.r - 10}`}
        fill="none"
        stroke={P.line}
        strokeWidth={1.6}
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <text
        x={lx}
        y={48}
        fontFamily={MONO}
        fontSize={26}
        letterSpacing="0.04em"
        fill={P.ink}
        opacity={line(0)}
      >
        {C.stubDate}
      </text>
      <text
        x={lx}
        y={115}
        fontFamily={ARCHIVO}
        fontWeight={800}
        fontSize={54}
        letterSpacing="-0.01em"
        fill={P.ink}
        opacity={line(1)}
      >
        {C.stubCity}
      </text>
      <text
        x={lx}
        y={160}
        fontFamily={ARCHIVO}
        fontWeight={600}
        fontSize={26}
        letterSpacing="0.04em"
        fill={P.ink}
        opacity={line(2)}
      >
        {C.stubVenue}
      </text>
      <text
        x={rx}
        y={48}
        fontFamily={ARCHIVO}
        fontWeight={600}
        fontSize={14}
        letterSpacing="0.16em"
        fill={P.label}
        opacity={line(3)}
      >
        {C.stubAdmit}
      </text>
      <text
        x={rx}
        y={120}
        fontFamily={ARCHIVO}
        fontWeight={600}
        fontSize={14}
        letterSpacing="0.16em"
        fill={P.label}
        opacity={line(4)}
      >
        {C.stubNo}
      </text>
      <text
        x={rx}
        y={175}
        fontFamily={MONO}
        fontWeight={500}
        fontSize={48}
        fill={P.accentText}
        opacity={line(5)}
      >
        {C.stubSerial}
      </text>
    </svg>
  );
};

// the cursor: its tip is the hot spot; the SVG is offset so x, y place the tip
const CURSOR_D = "M5 3 L5 19 L9 15 L12 22 L15 20.5 L11.5 14 L18 14 Z";
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < E.cursor_enter) return null;
  const H = L.cursor.height;
  const k = H / 24;
  const date = { x: L.dateField.x + 40, y: L.dateField.y + 28 };
  const venue = { x: L.venueField.x + 40, y: L.venueField.y + 28 };
  const btn = {
    x: L.button.x + L.button.w / 2 + L.cursor.buttonOffset[0],
    y: L.button.y + L.button.h / 2 + L.cursor.buttonOffset[1],
  };
  const stops = [
    E.cursor_enter,
    E.cursor_at_date,
    110,
    E.cursor_at_venue,
    E.cursor_leave_venue,
    E.cursor_at_button,
    E.cursor_park_start,
    E.cursor_parked,
  ];
  const eases = [
    quintOut,
    linear,
    quintOut,
    linear,
    quintOut,
    linear,
    quintOut,
  ];
  const x = interpolate(
    frame,
    stops,
    [
      L.cursor.start[0],
      date.x,
      date.x,
      venue.x,
      venue.x,
      btn.x,
      btn.x,
      L.cursor.park[0],
    ],
    { easing: eases, ...clamp },
  );
  const y = interpolate(
    frame,
    stops,
    [
      L.cursor.start[1],
      date.y,
      date.y,
      venue.y,
      venue.y,
      btn.y,
      btn.y,
      L.cursor.park[1],
    ],
    { easing: eases, ...clamp },
  );
  // two small clicks on the fields, then the press (down 3 frames linear, back.out(1.6) release)
  const c1 = E.click_date - 1;
  const c2 = E.click_venue - 1;
  const scale = interpolate(
    frame,
    [
      c1,
      c1 + 3,
      c1 + 6,
      c2,
      c2 + 3,
      c2 + 6,
      E.press - 1,
      E.release - 1,
      E.release_settled - 1,
    ],
    [1, 0.86, 1, 1, 0.86, 1, 1, 0.86, 1],
    {
      easing: [
        linear,
        linear,
        linear,
        linear,
        linear,
        linear,
        linear,
        backOut(1.6),
      ],
      ...clamp,
    },
  );
  return (
    <svg
      id="cursor"
      viewBox="0 0 24 24"
      width={H}
      height={H}
      style={{
        position: "absolute",
        left: x - 5 * k,
        top: y - 3 * k,
        overflow: "visible",
        transformOrigin: `${5 * k}px ${3 * k}px`,
        scale: String(scale),
      }}
    >
      <path
        d={CURSOR_D}
        fill={P.ink}
        stroke={P.paper}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ---- the closing card ------------------------------------------------------------------------
const Closing: React.FC = () => {
  const f = useCurrentFrame(); // local to the Sequence: 0 at the closing cut
  const cut = E.closing_cut;
  const logoIn = E.logo_settled - cut;
  const wm0 = E.wordmark_settled - cut - 12;
  const ln0 = E.line_settled - cut - 12;
  return (
    <>
      <Img
        src={staticFile("indieagent-mark.svg")}
        style={{
          position: "absolute",
          left: L.logo.cx - L.logo.size / 2,
          top: L.logo.cy - L.logo.size / 2,
          width: L.logo.size,
          height: L.logo.size,
          transformOrigin: "50% 50%",
          scale: String(
            interpolate(f, [-1, logoIn - 1], [0.6, 1], {
              easing: quartOut,
              ...clamp,
            }),
          ),
          opacity: interpolate(f, [-1, 7], [0, 1], {
            easing: quadOut,
            ...clamp,
          }),
        }}
      />
      <svg
        width={1080}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <text
          x={540}
          y={L.wordmarkBaseline}
          textAnchor="middle"
          fontFamily={ARCHIVO}
          fontWeight={800}
          fontSize={64}
          letterSpacing="-0.02em"
          fill={P.ink}
          opacity={interpolate(f, [wm0 - 1, wm0 + 11], [0, 1], {
            easing: expoOut,
            ...clamp,
          })}
          style={{
            translate: `0px ${interpolate(f, [wm0 - 1, wm0 + 11], [12, 0], { easing: expoOut, ...clamp })}px`,
          }}
        >
          {C.wordmark}
        </text>
        <text
          x={540}
          y={L.lineBaseline}
          textAnchor="middle"
          fontFamily={ARCHIVO}
          fontWeight={500}
          fontSize={30}
          fill={P.label}
          opacity={interpolate(f, [ln0 - 1, ln0 + 11], [0, 1], {
            easing: expoOut,
            ...clamp,
          })}
          style={{
            translate: `0px ${interpolate(f, [ln0 - 1, ln0 + 11], [12, 0], { easing: expoOut, ...clamp })}px`,
          }}
        >
          {C.line}
        </text>
      </svg>
    </>
  );
};

// ---- debug: the brief's boxes and the measured width of every line, so text fit is a number ----
type Measured = {
  text: string;
  font: string;
  letterSpacing: number;
  box: [number, number, number, number];
  align?: "center";
};
const measure = (m: Measured) => {
  const cv = document.createElement("canvas");
  const g = cv.getContext("2d");
  if (!g) return 0;
  g.font = m.font;
  (g as unknown as { letterSpacing: string }).letterSpacing =
    `${m.letterSpacing}px`;
  return g.measureText(m.text).width;
};
const Debug: React.FC<{ closing: boolean }> = ({ closing }) => {
  const S = L.stub;
  const rows: Measured[] = closing
    ? [
        {
          text: C.wordmark,
          font: `800 64px ${ARCHIVO}`,
          letterSpacing: -1.28,
          box: [72, 540, 936, 70],
          align: "center",
        },
        {
          text: C.line,
          font: `500 30px ${ARCHIVO}`,
          letterSpacing: 0,
          box: [72, 620, 936, 40],
          align: "center",
        },
      ]
    : [
        {
          text: C.headline,
          font: `800 56px ${ARCHIVO}`,
          letterSpacing: -0.56,
          box: [L.headline.x, L.headline.y, L.headline.w, L.headline.h],
          align: "center",
        },
        {
          text: C.list[2],
          font: `400 16px ${MONO}`,
          letterSpacing: 0,
          box: [
            L.list.x + 20,
            L.list.y + 2 * L.list.step,
            L.listInner,
            L.list.h,
          ],
        },
        {
          text: C.dateValue,
          font: `400 20px ${MONO}`,
          letterSpacing: 0,
          box: [L.dateField.x + 16, L.dateField.y, L.fieldInner, L.dateField.h],
        },
        {
          text: C.venueValue,
          font: `400 20px ${MONO}`,
          letterSpacing: 0,
          box: [
            L.venueField.x + 16,
            L.venueField.y,
            L.fieldInner,
            L.venueField.h,
          ],
        },
        {
          text: C.button,
          font: `600 24px ${ARCHIVO}`,
          letterSpacing: 0,
          box: [L.button.x + 16, L.button.y, L.buttonInner, L.button.h],
          align: "center",
        },
        {
          text: C.stubDate,
          font: `400 26px ${MONO}`,
          letterSpacing: 1.04,
          box: [S.leftColumn.x, S.y + 22, S.leftColumn.w, 34],
        },
        {
          text: C.stubCity,
          font: `800 54px ${ARCHIVO}`,
          letterSpacing: -0.54,
          box: [S.leftColumn.x, S.y + 62, S.leftColumn.w, 60],
        },
        {
          text: C.stubVenue,
          font: `600 26px ${ARCHIVO}`,
          letterSpacing: 1.04,
          box: [S.leftColumn.x, S.y + 134, S.leftColumn.w, 34],
        },
        {
          text: C.stubAdmit,
          font: `600 14px ${ARCHIVO}`,
          letterSpacing: 2.24,
          box: [S.rightColumn.x, S.y + 30, S.rightColumn.w, 24],
        },
        {
          text: C.stubSerial,
          font: `500 48px ${MONO}`,
          letterSpacing: 0,
          box: [S.rightColumn.x, S.y + 128, S.rightColumn.w, 54],
        },
      ];
  const boxes: [number, number, number, number][] = closing
    ? [[L.logo.cx - 80, L.logo.cy - 80, 160, 160]]
    : [
        [L.card.x, L.card.y, L.card.w, L.card.h],
        [L.button.x, L.button.y, L.button.w, L.button.h],
        [S.x, S.y, S.w, S.h],
      ];
  return (
    <svg
      width={1080}
      height={1080}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {boxes.map((b, i) => (
        <rect
          key={`b${i}`}
          x={b[0]}
          y={b[1]}
          width={b[2]}
          height={b[3]}
          fill="none"
          stroke="#1E90FF"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
      ))}
      {rows.map((m, i) => {
        const w = measure(m);
        const ok = w <= m.box[2];
        return (
          <g key={`m${i}`}>
            <rect
              x={m.box[0]}
              y={m.box[1]}
              width={m.box[2]}
              height={m.box[3]}
              fill="none"
              stroke={ok ? "#1E90FF" : "#FF0040"}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={m.box[0] + m.box[2]}
              y={m.box[1] - 3}
              textAnchor="end"
              fontFamily={MONO}
              fontSize={11}
              fill={ok ? "#1E90FF" : "#FF0040"}
            >
              {`${Math.round(w)} / ${m.box[2]} px`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ---- the composition -------------------------------------------------------------------------
export const Launch: React.FC<DebugProps> = ({ debug }) => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${P.paper} 55%, ${P.paperEdge} 100%)`,
        fontFamily: ARCHIVO,
      }}
    >
      <Sequence
        durationInFrames={E.closing_cut}
        layout="none"
        name="The screen"
      >
        <Card />
        <Ripple />
        <Stub />
        <Cursor />
        <Headline />
        {debug ? <Debug closing={false} /> : null}
      </Sequence>
      <Sequence from={E.closing_cut} layout="none" name="Closing card">
        <Closing />
        {debug ? <Debug closing /> : null}
      </Sequence>
    </AbsoluteFill>
  );
};
