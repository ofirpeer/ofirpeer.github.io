(function() {

    // get all data in form and return object
    function getFormData(form) {
      var elements = form.elements;
      var honeypot;
  
      var fields = Object.keys(elements).filter(function(k) {
        if (elements[k].name === "honeypot") {
          honeypot = elements[k].value;
          return false;
        }
        return true;
      }).map(function(k) {
        if(elements[k].name !== undefined) {
          return elements[k].name;
        // special case for Edge's html collection
        } else if(elements[k].length > 0){
          return elements[k].item(0).name;
        }
      }).filter(function(item, pos, self) {
        return self.indexOf(item) == pos && item;
      });
  
      var formData = {};
      fields.forEach(function(name){
        var element = elements[name];

        if(element.type === "checkbox"){
          formData[name] = element.checked;
        } else {
          formData[name] = element.value;
        }
      });
  
      // add form-specific values into the data
      formData.formDataNameOrder = JSON.stringify(fields);
      formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
      formData.formGoogleSendEmail
        = form.dataset.email || ""; // no email by default
  
      return {data: formData, honeypot: honeypot};
    }
  
    function handleFormSubmit(event) {
      event.preventDefault();

      // Validations
      const phoneRegex = /^(?:\d{2,3}-)?\d{6,}$/g;
      var nameField = document.querySelector("#name");
      var phoneField = document.querySelector("#phone");
      var numberField = document.querySelector("#number");

      nameField.classList.remove("error");
      phoneField.classList.remove("error");
      numberField.classList.remove("error");

      if(!nameField.value){
        nameField.classList.add("error");
        return;
      } else if(!phoneField.value || !phoneField.value.match(phoneRegex)){
        phoneField.classList.add("error");
        return;
      } 
      else if(!numberField.value || isNaN(numberField.value) || numberField.value <=0 || numberField.value > 9){
        numberField.classList.add("error");
        return
      } 


      var form = event.target;
      var formData = getFormData(form);
      var data = formData.data;
  
      // If a honeypot field is filled, assume it was done so by a spam bot.
      if (formData.honeypot) {
        return false;
      }
  
      disableAllButtons(form);
      
      var url = form.action;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      // xhr.withCredentials = true;
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            form.reset();

            var envelope = document.querySelector('.envelope')
            envelope.classList.add("close")
            var submit = document.querySelector('.submit')
            submit.classList.add("close")
          }
      };
      // url encode form data for sending as post data
      var encoded = Object.keys(data).map(function(k) {
          return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join('&');
      xhr.send(encoded);
    }
  
    function disableAllButtons(form) {
      var buttons = form.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
      }

      var submitBtn = document.getElementById("done");
      submitBtn.disabled = true;
      submitBtn.querySelector(".text").style.display = "none";
      submitBtn.querySelector(".loader").style.display = "inline";
    }

        
    function loaded() {
      // Connect form to google sheets
      var forms = document.querySelectorAll("form.gform");
      for (var i = 0; i < forms.length; i++) {
        forms[i].addEventListener("submit", handleFormSubmit, false);
      }

      // Add parallax effect to the decoration
      var scene = document.getElementById('scene');
      var parallaxInstance = new Parallax(scene);
      parallaxInstance.calibrate(true, true);
      parallaxInstance.friction(0.8, 0.8);
  
      // Smooth scroll
      document.querySelector('#scroll-to-when').addEventListener("click", () => {
        document.querySelector('.when').scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      });
      document.querySelector('#scroll-to-landing').addEventListener("click", () => {
        document.querySelector('.landing').scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      });

      // Modal buttons handlers
      document.querySelector('#see-you').addEventListener("click", () => {
        document.querySelector(".submit-modal").style.display = "none";
      });
      document.querySelector('#modal-close').addEventListener("click", () => {
        document.querySelector(".submit-modal").style.display = "none";
      });
    };
    document.addEventListener("DOMContentLoaded", loaded, false);
  })();