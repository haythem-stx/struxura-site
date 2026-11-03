// ============================================
// STRUXURA — SÉLECTEUR DE MODULE (quiz 4 questions)
// Logique de scoring + soumission HubSpot dédiée
// (formulaire "Struxura - Sélecteur module", séparé
// du formulaire diagnostic géré dans main.js)
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  const DOMAINS = {
    loyalty: {
      label: "Loyalty et Intelligence Consommateur",
      audit: { code: "STX-01", name: "Audit Data Consommateur" },
      build: [
        { code: "STX-02", name: "Infrastructure Loyalty Conversationnelle" },
        { code: "STX-03", name: "Mécanisme Code In-Pack" },
        { code: "STX-04", name: "Dashboard Intelligence Consommateur" }
      ]
    },
    acquisition: {
      label: "Acquisition et Génération de Demande",
      audit: { code: "STX-05", name: "Audit Performance Acquisition" },
      build: [
        { code: "STX-06", name: "Architecture Campagne Acquisition" },
        { code: "STX-07", name: "Système de Qualification Leads" }
      ]
    },
    data: {
      label: "Data et Mesure de Performance",
      audit: { code: "STX-08", name: "Audit Maturité Data" },
      build: [
        { code: "STX-09", name: "Setup Tracking et Mesure" },
        { code: "STX-10", name: "Dashboard Performance Commerciale et Marketing" }
      ]
    },
    commerciale: {
      label: "Architecture Commerciale",
      audit: { code: "STX-11", name: "Diagnostic Flash Commercial" },
      build: [
        { code: "STX-12", name: "Structuration Offre et Pricing" },
        { code: "STX-13", name: "Architecture Pipeline et Cycle de Vente" }
      ]
    },
    crm: {
      label: "CRM et Pipeline Opérationnel",
      audit: { code: "STX-14", name: "Audit et Restructuration CRM" },
      build: [
        { code: "STX-15", name: "Setup CRM from Scratch" },
        { code: "STX-16", name: "Séquences Outreach B2B" }
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

    // Barre de progression : reste sur 4 segments, se fige au dernier une fois le résultat affiché.
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

  // --- Sélection des options (clic = réponse + avance automatiquement) ---
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

  // --- Calcul et affichage du résultat ---
  function renderResult() {
    const domain = DOMAINS[answers.domaine];
    if (!domain) return;
    const isDiagnostic = answers.stade === "diagnostic";
    const modules = isDiagnostic ? [domain.audit] : domain.build;

    const toneMessage = answers.moment === "lance"
      ? `Vous lancez quelque chose de nouveau : c'est le moment de poser la bonne architecture avant qu'elle ne se rigidifie autour d'un mauvais départ. Domaine identifié : <strong>${domain.label}</strong>.`
      : `Ça tourne déjà, mais c'est instable : c'est exactement le type de situation que Struxura corrige. Domaine identifié : <strong>${domain.label}</strong>.`;

    document.getElementById("resultTone").innerHTML = toneMessage;

    const modulesContainer = document.getElementById("resultModules");
    modulesContainer.innerHTML = "";

    if (isDiagnostic) {
      const m = modules[0];
      modulesContainer.innerHTML = `
        <div class="result-module-card">
          <p class="module-code">${m.code}</p>
          <h3>${m.name}</h3>
          <p>Le point de départ logique avant d'aller plus loin : ce module pose un diagnostic clair de votre situation dans ce domaine.</p>
        </div>`;
    } else {
      modulesContainer.innerHTML = modules.map(m => `
        <div class="result-module-card">
          <p class="module-code">${m.code}</p>
          <h3>${m.name}</h3>
        </div>`).join("");
    }

    // Valeurs pour les champs cachés HubSpot, calculées ici et lues au submit.
    resultPayload.domaine = domain.label;
    resultPayload.module = modules.map(m => `${m.code} — ${m.name}`).join(", ");
    resultPayload.taille = answers.taille;
  }

  const resultPayload = { domaine: "", module: "", taille: "" };

  // --- Soumission du formulaire de capture (formulaire HubSpot dédié) ---
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
          errorMsg.textContent = "Ce champ est obligatoire.";
        } else if (this.validity.typeMismatch && this.type === "email") {
          errorMsg.textContent = "Merci de vérifier le format de votre adresse email.";
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

      btn.textContent = "Envoi en cours...";
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
                              <h3 style="color: var(--dark); margin-bottom: 10px;">Merci.</h3>
                              <p style="margin-bottom:0;">Nous revenons vers vous sous 48h avec le détail du ou des modules identifiés pour votre situation.</p>
                            </div>`;
        } else {
          throw new Error("API Error");
        }
      } catch (error) {
        if (msgDiv) {
          msgDiv.textContent = "Une erreur est survenue. Merci de réessayer ou de nous contacter directement à admin@struxura.com.";
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
