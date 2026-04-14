export type ElementType = "text" | "image" | "audio";

export interface Board {
  id: string;
  title: string;
  cover_color: string | null;
  created_at: string;
  created_by: string;
}

export interface ElementStyle {
  fontSize?: number;
  color?: string;
  background?: string;
  opacity?: number;
  fontWeight?: number;
}

export interface CanvasElement {
  id: string;
  board_id: string;
  type: ElementType;
  content: string | null;
  url: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: ElementStyle | null;
  z_index: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_color: string | null;
}

export interface PresenceCursor {
  user_id: string;
  display_name: string;
  avatar_color: string;
  x: number;
  y: number;
  board_id: string;
  selected_element_id?: string | null;
}
