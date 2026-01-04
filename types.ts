
export enum GameIntensity {
  MILD = 'Nhẹ nhàng',
  STEAMY = 'Quyến rũ',
  WILD = 'Táo bạo',
  EXTREME = 'Cuồng nhiệt'
}

export interface Player {
  id: string;
  name: string;
}

export interface DiceResult {
  action: string;
  bodyPart: string;
  duration: number; // Thời gian tính bằng giây
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  intensity: GameIntensity;
  lastResult: DiceResult | null;
  isRolling: boolean;
}
