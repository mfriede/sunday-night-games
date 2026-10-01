import GamePage from "../components/GamePage";
import FlappyDonut from "../components/FlappyDonut";

export default function FlappyDonutPage() {
  return (
    <GamePage
      title="Flappy Donut"
      genre="Arcade"
      instructions="Tap space or click to flap. Thread the gaps and keep your donut in the air!"
    >
      <FlappyDonut />
    </GamePage>
  );
}
