// ============================================
// STRUXURA — MODULE SELECTOR (4-question quiz), EN version
// Same scoring logic and HubSpot submission as the FR
// selecteur.js, targeting the same dedicated HubSpot form
// ("Struxura - Sélecteur module").
//
// IMPORTANT: the domain/module/team-size VALUES posted to
// HubSpot (resultPayload) are kept in FRENCH on purpose, to
// match the existing HubSpot property option values (created
// alongside the FR form) so both language versions land in
// the same dropdown options and stay reportable together.
// Only the on-screen labels are in English (labelEN / nameEN).
// If the HubSpot properties are actually free text rather than
// a fixed dropdown, it's safe to switch the payload to English
// by using labelEN/nameEN instead of label/name below.
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  const DOMAINS = {
    loyalty: {
      label: "Loyalty et Intelligence Consommateur",
      labelEN: "Loyalty and Consumer Intelligence",
      audit: { code: "STX-01", name: "Audit Data Consommateur", nameEN: "Consumer Data Audit" },
      build: [
        { code: "STX-02", name: "Infrastructure Loyalty Conversationnelle", nameEN: "Conversational Loyalty Infrastructure" },
        { code: "STX-03", name: "Mécanisme Code In-Pack", nameEN: "In-Pack Code Mechanism" },
        { code: "STX-04", name: "Dashboard Intelligence Consommateur", nameEN: "Consumer Intelligence Dashboard" }
      ]
    },
    acquisition: {
      label: "Acquisition et Génération de Demande",
      labelEN: "Acquisition and Demand Generation",
      audit: { code: "STX-05", name: "Audit Performance Acquisition", nameEN: "Acquisition Performance Audit" },
      build: [
        { code: "STX-06", name: "Architecture Campagne Acquisition", nameEN: "Acquisition Campaign Architecture" },
        { code: "STX-07", name: "Système de Qualification Leads", nameEN: "Lead Qualification System" }
      ]
    },
    data: {
      label: "Data et Mesure de Performance",
      labelEN: "Data and Performance Measurement",
      audit: { code: "STX-08", name: "Audit Maturité Data", nameEN: "Data Maturity Audit" },
      build: [
        { code: "STX-09", name: "Setup Tracking et Mesure", nameEN: "Tracking and Measurement Setup" },
        { code: "STX-10", name: "Dashboard Performance Commerciale et Marketing", nameEN: "Sales and Marketing Performance Dashboard" }
      ]
    },
    commerciale: {
      label: "Architecture Commerciale",
      labelEN: "Sales Architecture",
      audit: { code: "STX-11", name: "Diagnostic Flash Commercial", nameEN: "Sales Flash Diagnostic" },
      build: [
        { code: "STX-12", name: "Structuration Offre et Pricing", nameEN: "Offer and Pricing Structuring" },
        { code: "STX-13", name: "Architecture Pipeline et Cycle de Vente", nameEN: "Pipeline and Sales Cycle Architecture" }
      ]
    },
    crm: {
      label: "CRM et Pipeline Opérationnel",
      labelEN: "CRM and Operational Pipeline",
      audit: { code: "STX-14", name: "Audit et Restructuration CRM", nameEN: "CRM Audit and Restructuring" },
      build: [
        { code: "STX-15", name: "Setup CRM from Scratch", nameEN: "CRM Setup From Scratch" },
        { code: "STX-16", name: "Séquences Outreach B2B", nameEN: "B2B Outreach Sequences" }
      ]
    }
  };

  const answers = { domaine: null, stade: null, moment: null, taille: null };
  const stepOrder = ["1", "2", "3", "4", "result"];
  let currentStepIndex = 0;

  const progressSteps = document.querySelectorAll(".quiz-progress-step");
  const stepEls = {};
  document.querySelectorAll(".quiz-step").forEach(el => {
    stepEls[el.dataset.step] = el;
  });

  function showStep(index) {
    currentStepIndex = index;
    const stepKey = stepOrder[index];
    Object.values(stepEls).forEach(el => el.classList.remove("active"));
    stepEls[stepKey].classList.add("active");

    // Progress bar: stays on 4 segments, freezes on the last one once the result shows.
    const activeCount = stepKey === "result" ? 4 : parseInt(stepKey, 10);
    progressSteps.forEach(seg => {
      seg.classList.toggle("active", parseInt(seg.dataset.step, 10) <= activeCount);
    });

    window.scrollTo({ top: document.querySelector(".quiz-container").offsetTop - 100, behavior: "smooth" });
  }

  function goNext() {
    if (currentStepIndex < stepOrder.length - 1) showStep(currentStepIndex + 1);
  }
  function goBack() {
    if (currentStepIndex > 0) showStep(currentStepIndex - 1);
  }

  // --- Option selection (click = answer + auto-advance) ---
  document.querySelectorAll(".quiz-options").forEach(group => {
    const questionKey = group.dataset.question;
    group.querySelectorAll(".quiz-option").forEach(opt => {
      opt.addEventListener("click", () => {
        group.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        answers[questionKey] = opt.dataset.value;

        if (questionKey === "taille") {
          renderResult();
        }
        setTimeout(goNext, 200);
      });
    });
  });

  document.querySelectorAll(".quiz-back").forEach(btn => {
    if (btn.id === "resultRestart") return;
    btn.addEventListener("click", goBack);
  });

  const restartBtn = document.getElementById("resultRestart");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      answers.domaine = answers.stade = answers.moment = answers.taille = null;
      document.querySelectorAll(".quiz-option.selected").forEach(o => o.classList.remove("selected"));
      showStep(0);
    });
  }

  // --- Result calculation and display ---
  function renderResult() {
    const domain = DOMAINS[answers.domaine];
    if (!domain) return;
    const isDiagnostic = answers.stade === "diagnostic";
    const modules = isDiagnostic ? [domain.audit] : domain.build;

    const toneMessage = answers.moment === "lance"
      ? `You're launching something new: now's the time to get the architecture right before it hardens around a bad start. Domain identified: <strong>${domain.labelEN}</strong>.`
      : `It's already running, but it's unstable: that's exactly the kind of situation Struxura fixes. Domain identified: <strong>${domain.labelEN}</strong>.`;

    document.getElementById("resultTone").innerHTML = toneMessage;

    const modulesContainer = document.getElementById("resultModules");
    modulesContainer.innerHTML = "";

    if (isDiagnostic) {
      const m = modules[0];
      modulesContainer.innerHTML = `
        <div class="result-module-card">
          <p class="module-code">${m.code}</p>
          <h3>${m.nameEN}</h3>
          <p>The logical starting point before going further: this module gives you a clear diagnostic of your situation in this domain.</p>
        </div>`;
    } else {
      modulesContainer.innerHTML = modules.map(m => `
        <div class="result-module-card">
          <p class="module-code">${m.code}</p>
          <h3>${m.nameEN}</h3>
        </div>`).join("");
    }

    // Values for the hidden HubSpot fields, computed here and read on submit.
    // Kept in French to match the existing property option values — see note at the top of this file.
    resultPayload.domaine = domain.label;
    resultPayload.module = modules.map(m => `${m.code} — ${m.name}`).join(", ");
    resultPayload.taille = answers.taille;
  }

  const resultPayload = { domaine: "", module: "", taille: "" };

  // --- Lead form submission (dedicated HubSpot form) ---
  const form = document.getElementById("quizLeadForm");
  if (form) {
    const portalId = "147416473";
    const formId = "3d27a632-5b78-405c-9c77-57b617c5521e"; // Struxura - Sélecteur module
    const hsEndpoint = `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

    const inputs = form.querySelectorAll("input");
    inputs.forEach(input => {
      input.addEventListener("invalid", function (e) {
        e.preventDefault();
        let errorMsg = this.nextElementSibling;
        if (!errorMsg || !errorMsg.classList.contains("form-error")) {
          errorMsg = document.createElement("div");
          errorMsg.className = "form-error";
          this.parentNode.insertBefore(errorMsg, this.nextSibling);
        }
        if (this.validity.valueMissing) {
          errorMsg.textContent = "This field is required.";
        } else if (this.validity.typeMismatch && this.type === "email") {
          errorMsg.textContent = "Please check your email address format.";
        }
        errorMsg.style.display = "block";
        this.style.borderColor = "#d32f2f";
      });
      input.addEventListener("input", function () {
        let errorMsg = this.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains("form-error")) {
          errorMsg.style.display = "none";
          this.style.borderColor = "var(--dark-muted)";
        }
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const msgDiv = form.querySelector(".form-message");
      const originalLabel = btn.textContent;

      btn.textContent = "Sending...";
      btn.disabled = true;

      const formData = new FormData(form);
      const data = {
        fields: [
          { name: "firstname", value: formData.get("firstname") || "" },
          { name: "lastname", value: formData.get("lastname") || "" },
          { name: "email", value: formData.get("email") || "" },
          { name: "struxura__domaine_recommande", value: resultPayload.domaine },
          { name: "struxura__module_recommande", value: resultPayload.module },
          { name: "struxura__taille_equipe", value: resultPayload.taille }
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };
      if (formData.get("phone")) data.fields.push({ name: "phone", value: formData.get("phone") });
      if (formData.get("company")) data.fields.push({ name: "company", value: formData.get("company") });

      try {
        const response = await fetch(hsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          form.innerHTML = `<div style="padding: 30px; text-align: center; border: 1px solid var(--cyan); background: var(--cyan-dim); border-radius: 4px;">
                              <h3 style="color: var(--dark); margin-bottom: 10px;">Thank you.</h3>
                              <p style="margin-bottom:0;">We'll be in touch within 48h with the details of the module(s) identified for your situation.</p>
                            </div>`;
        } else {
          throw new Error("API Error");
        }
      } catch (error) {
        if (msgDiv) {
          msgDiv.textContent = "Something went wrong. Please try again or contact us directly at admin@struxura.com.";
          msgDiv.style.display = "block";
          msgDiv.style.borderColor = "#d32f2f";
          msgDiv.style.background = "#ffebee";
        }
        btn.textContent = originalLabel;
        btn.disabled = false;
      }
    });
  }

});
