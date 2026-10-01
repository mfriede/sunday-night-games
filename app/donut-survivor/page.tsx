import GamePage from "../components/GamePage";
import DonutSurvivor from "../components/DonutSurvivor";

export default function DonutSurvivorPage() {
  return (
    <GamePage
      title="Donut Survivor"
      genre="Platformer"
      instructions="Use the arrow keys or WASD to move and jump. Collect coins to score points!"
    >
      <DonutSurvivor />
    </GamePage>
  );
}
