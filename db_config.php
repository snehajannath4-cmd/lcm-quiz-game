<?php
include 'db_config.php';

if(isset($_POST['name']) && isset($_POST['score'])) {
  $name = $_POST['name'];
  $score = $_POST['score'];

  $sql = "INSERT INTO players (name, score) VALUES ('$name', '$score')";
  if ($conn->query($sql) === TRUE) {
    echo "🎉 Score saved successfully!";
  } else {
    echo "❌ Error: " . $conn->error;
  }
}
$conn->close();
?>