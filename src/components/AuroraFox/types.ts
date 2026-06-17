export type AuroraState =
  | "idle"
  | "thinking"
  | "success"
  | "empathetic";

export interface AuroraProps {
  currentState: AuroraState;
  productSkin?: "vibelearn" | "none";
}