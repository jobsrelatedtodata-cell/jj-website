(function () {
  const frameCount = 240;
  const canvas = document.getElementById("idolCanvas");
  const context = canvas.getContext("2d");
  const hero = document.querySelector(".scroll-hero");
  const images = [];
  const state = {
    currentFrame: 0,
    targetFrame: 0,
    loaded: 0,
    width: 1280,
    height: 720,
  };

  document.body.classList.add("is-loading");

  function framePath(index) {
    return `assets/frames/frame_${String(index).padStart(6, "0")}.jpg`;
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawFrame(Math.round(state.currentFrame));
  }

  function drawCover(image) {
    if (!image || !image.complete) return;

    const rect = canvas.getBoundingClientRect();
    const canvasRatio = rect.width / rect.height;
    const imageRatio = state.width / state.height;
    let drawWidth = rect.width;
    let drawHeight = rect.height;
    let x = 0;
    let y = 0;

    if (canvasRatio > imageRatio) {
      drawHeight = rect.width / imageRatio;
      y = (rect.height - drawHeight) / 2;
    } else {
      drawWidth = rect.height * imageRatio;
      x = (rect.width - drawWidth) / 2;
    }

    context.clearRect(0, 0, rect.width, rect.height);
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function drawFrame(index) {
    drawCover(images[index] || images[0]);
  }

  function updateTargetFrame() {
    const rect = hero.getBoundingClientRect();
    const scrollable = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    state.targetFrame = progress * (frameCount - 1);
  }

  function animate() {
    state.currentFrame += (state.targetFrame - state.currentFrame) * 0.22;
    drawFrame(Math.round(state.currentFrame));
    requestAnimationFrame(animate);
  }

  function preloadFrames() {
    for (let i = 0; i < frameCount; i += 1) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = function () {
        state.loaded += 1;
        if (i === 0) {
          state.width = img.naturalWidth || state.width;
          state.height = img.naturalHeight || state.height;
          resizeCanvas();
          document.body.classList.remove("is-loading");
        }
      };
      images[i] = img;
    }
  }

  window.addEventListener("scroll", updateTargetFrame, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  preloadFrames();
  updateTargetFrame();
  animate();

  const form = document.getElementById("appointmentForm");
  const note = document.getElementById("formNote");
  const submitButton = form.querySelector('button[type="submit"]');
  const supabaseUrl = "https://djsspdcvxfkabuuanssi.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc3NwZGN2eGZrYWJ1dWFuc3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTU3MDEsImV4cCI6MjA5Nzg3MTcwMX0.BcPWIvmbByECPibnJWRrZqm5wV_iHIBAa16dz-HOQCY";

  async function saveEnquiry(payload) {
    const response = await fetch(`${supabaseUrl}/rest/v1/appointment_enquiries`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Could not save enquiry");
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const enquiry = {
      full_name: String(data.get("name") || "").trim(),
      mobile_number: String(data.get("phone") || "").trim(),
      preferred_date: data.get("date"),
      preferred_time: data.get("time"),
      gold_details: String(data.get("details") || "").trim(),
      user_agent: navigator.userAgent,
    };
    const message = [
      "Hello JJ Gold Centre, I would like to book an appointment.",
      "",
      `Name: ${enquiry.full_name}`,
      `Mobile: ${enquiry.mobile_number}`,
      `Preferred date: ${enquiry.preferred_date}`,
      `Preferred time: ${enquiry.preferred_time}`,
      `Gold details: ${enquiry.gold_details}`,
    ].join("\n");

    submitButton.disabled = true;
    note.textContent = "Saving your enquiry...";

    try {
      await saveEnquiry(enquiry);
      note.textContent = "Enquiry saved. Opening WhatsApp with your details...";
      window.open(`https://wa.me/918274999699?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      form.reset();
    } catch (error) {
      note.textContent = "We could not save the enquiry. Please call or WhatsApp JJ Gold Centre directly.";
    } finally {
      submitButton.disabled = false;
    }
  });
})();
