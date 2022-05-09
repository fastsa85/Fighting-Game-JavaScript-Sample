function rectangularCollisions({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.size.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <=
      rectangle2.position.y + rectangle2.size.height
  );
}

function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);
  console.log(player.healthCurrent);
  console.log(enemy.healthCurrent);
  var playerScores = (player.healthCurrent / player.healthMax) * 100;
  var enemyScores = (enemy.healthCurrent / enemy.healthMax) * 100;
  if (playerScores === enemyScores) {
    document.querySelector('#displayText').innerHTML = 'Tie';
  } else if (playerScores > enemyScores) {
    document.querySelector('#displayText').innerHTML = 'Samurai Mack Wins';
  } else if (playerScores < enemyScores) {
    document.querySelector('#displayText').innerHTML = 'Kenji Wins';
  }
  document.querySelector('#displayText').style.display = 'flex';
}
