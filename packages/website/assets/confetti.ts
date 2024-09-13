/// <reference lib="dom" />
import confetti from "canvas-confetti";

(() => {
  window.confetti = confetti;
  const ws = new WebSocket(
    `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`,
  );
  let userId: string | null = null;
  let currentJoyCount: number | null = null;
  let isInitialDataProcessed = false;

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send(JSON.stringify({ type: "requestUserId" }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received WebSocket message:", data);

    if (data.type === "userId") {
      userId = data.id;
      console.log("Received userId:", userId);
    } else if (data.type === "confetti") {
      console.log(
        "Received confetti event. Current userId:",
        userId,
        "Event id:",
        data.id,
      );
      if (userId === null || data.id !== userId) {
        triggerConfetti();
      }
      updateJoyCounter(data.totalJoys);
    } else if (data.type === "initialData" && !isInitialDataProcessed) {
      console.log("Processing initial data:", data);
      currentJoyCount = data.totalJoys;
      updateJoyCounter(currentJoyCount);
      isInitialDataProcessed = true;
    }
  };

  function triggerConfetti() {
    console.log("Triggering confetti");
    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } else {
      console.error("Confetti function not found");
    }
  }

  function updateJoyCounter(count: number | null) {
    console.log(
      "Updating joy counter. New count:",
      count,
      "Current count:",
      currentJoyCount,
    );
    const counterElement = document.getElementById("joy-counter");
    if (counterElement && count !== null) {
      currentJoyCount = count;
      counterElement.textContent = String(count);
      console.log("Counter updated to:", count);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const confettiTrigger = document.querySelector(".confetti-trigger");
    if (confettiTrigger) {
      confettiTrigger.addEventListener("click", () => {
        console.log("Confetti trigger clicked");
        triggerConfetti();
        ws.send(JSON.stringify({ type: "confetti" }));
      });
    }

    const counterElement = document.getElementById("joy-counter");
    if (counterElement) {
      currentJoyCount = Number.parseInt(counterElement.textContent ?? "0", 10);
      console.log("Initial joy count from HTML:", currentJoyCount);
    }
  });
})();
