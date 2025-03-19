<script>
  export let playerPosition;
</script>

<div class="hud">
  <p>Position: X: {playerPosition.x.toFixed(2)}, Y: {playerPosition.y.toFixed(2)}, Z: {playerPosition.z.toFixed(2)}</p>
</div>

<style>
  .hud {
    position: absolute;
    top: 10px;
    left: 10px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 5px;
  }
</style>