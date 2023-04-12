import IMask from "imask";
import select2 from "select2";
import "select2/dist/js/i18n/ru";
import "select2/dist/css/select2.css";
import "../styles/third-case-styling.scss";
import companiesRegistry from "./companies-registry";

$(function () {
  const recordForm = $(".js-form");
  const phoneInput = $("#phone");
  const emailInput = $("#email");
  const firstnameInput = $("#firstname");
  const lastnameInput = $("#lastname");
  const companySelect = $(".js-company-select");
  const positionsSelect = $(".js-position-select");

  let companyStuff = [];

  // Define current record object
  let CURRENT_RECORD = {
    id: null,
    firstname: null,
    lastname: null,
    email: null,
    phone: null,
    company: null,
    position: null,
  };

  // Init records
  let records = [];
  updateRecords();
  renderRecords(records);

  // Convert registry to selec2 model
  const companies = companiesRegistry.map((e) => {
    return { id: e.id, text: e.company_name };
  });

  // Set general options for select
  const generalSelectOptions = {
    minimumResultsForSearch: -1,
    language: "ru",
  };

  // Set options for company select
  const companySelectOptions = {
    ...generalSelectOptions,
    placeholder: "Выберите компанию",
    data: companies,
  };

  // Set options for positions select
  const positionsSelectOptions = {
    ...generalSelectOptions,
    placeholder: "Выберите должность",
  };

  // Select fields initialization
  companySelect.select2(companySelectOptions);
  positionsSelect.select2(positionsSelectOptions);

  // Handle company selecting
  companySelect.on("change", () => {
    CURRENT_RECORD.position = null;
    const value = $(".js-company-select").val();
    const selectedCompany = findSelected(companiesRegistry, value);

    CURRENT_RECORD.company = selectedCompany;
    companyStuff = selectedCompany.stuff.map((x) => {
      return { id: x.id, text: x.position };
    });

    positionsSelectOptions.data = companyStuff;
    positionsSelect.html("<option></option>").select2(positionsSelectOptions);
  });

  // Handle position selecting
  positionsSelect.on("change", () => {
    const value = $(".js-position-select").val();
    const selectedPosition = findSelected(CURRENT_RECORD.company.stuff, value);

    CURRENT_RECORD.position = selectedPosition;
  });

  // Mask phone number input
  const phoneMaskOptions = {
    mask: "+{7} (000) 000-00-00",
  };
  const phoneMask = IMask(phoneInput[0], phoneMaskOptions);

  // Prevent submitting by Enter
  recordForm.on("keyup keypress", function (e) {
    var keyCode = e.key || e.which;
    if (keyCode === "Enter") {
      e.preventDefault();
      return false;
    }
  });

  // Check value
  const isRequired = (value) => (value === "" ? false : true);

  // Check email validity
  const isEmailValid = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  // Set error text in fieldset
  const setError = (input, message) => {
    const fieldSet = input.parent();

    const error = fieldSet.find(".form__error");
    error.text(message);
  };

  // Revove error from validated fieldset
  const unsetError = (input) => {
    const fieldSet = input.parent();

    const error = fieldSet.find(".form__error");
    error.empty();
  };

  // Validate text inputs
  const checkText = (input) => {
    let valid = false;
    const field = input.val().trim();
    const fieldId = input.attr("id");

    if (!isRequired(field)) {
      setError(input, "Поле не может быть пустым.");
    } else if (fieldId == "phone" && field.length < 18) {
      setError(input, "Неверный номер.");
    } else {
      unsetError(input);
      valid = true;
    }
    return valid;
  };

  // Validate email input
  const checkEmail = () => {
    let valid = false;
    const email = emailInput.val().trim();

    if (isRequired(email) && !isEmailValid(email)) {
      setError(emailInput, "Неверный адрес.");
    } else {
      unsetError(emailInput);
      valid = true;
    }
    return valid;
  };

  // Validate selects
  const checkSelect = (select) => {
    let valid = false;
    const type = select.attr("id");
    const value = CURRENT_RECORD[type];

    if (!CURRENT_RECORD[type]) {
      setError(select, "Значение не выбрано.");
    } else {
      unsetError(select);
      valid = true;
    }
    return valid;
  };

  //Handle submitting
  recordForm.on("submit", (e) => {
    e.preventDefault();

    let isPhoneValid = checkText(phoneInput),
      isEmailValid = checkEmail(),
      isFirstnameValid = checkText(firstnameInput),
      isLastnameValid = checkText(lastnameInput),
      isCompanySelected = checkSelect(companySelect),
      isPositionSelected = checkSelect(positionsSelect);

    let isFormValid =
      isPhoneValid &&
      isEmailValid &&
      isFirstnameValid &&
      isLastnameValid &&
      isCompanySelected &&
      isPositionSelected;

    // Prevent submitting while some fieldset not valid
    if (!isFormValid) {
      return;
    }

    // Valid record object
    CURRENT_RECORD = {
      id: records.length + 1,
      phone: phoneInput.val(),
      email: emailInput.val(),
      firstname: firstnameInput.val(),
      lastname: lastnameInput.val(),
      company: CURRENT_RECORD.company.company_name,
      position: CURRENT_RECORD.position.position,
    };

    // Send current record to localstorage
    records.push(CURRENT_RECORD);
    setLocalStorageRecords(records);

    // Rerender current record
    $(".js-records").append(
      `<tr><td>${CURRENT_RECORD.id}</td><td>${CURRENT_RECORD.lastname}</td><td>${CURRENT_RECORD.firstname}</td><td>${CURRENT_RECORD.email}</td><td>${CURRENT_RECORD.phone}</td><td>${CURRENT_RECORD.company}</td><td>${CURRENT_RECORD.position}</td></tr>`
    );

    // Reset form fields
    $(".js-form").find("input").val("");
    companySelect.html("<option></option>").select2(companySelectOptions);
    positionsSelect.html("<option></option>");

    // Reset current record object
    CURRENT_RECORD = {
      id: null,
      phone: null,
      email: null,
      phone: null,
      firstname: null,
      lastname: null,
      company: null,
      position: null,
    };
  });

  // Simple debounce
  const debounce = (fn, delay = 500) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn.apply(null, args);
      }, delay);
    };
  };

  // Handle form revalidation on change
  recordForm.on(
    "input change paste blur",
    debounce(function (e) {
      switch (e.target.id) {
        case "phone":
          checkText(phoneInput);
          break;
        case "email":
          checkEmail();
          break;
        case "firstname":
          checkText(firstnameInput);
          break;
        case "lastname":
          checkText(lastnameInput);
          break;
        case "company":
          checkSelect(companySelect);
          break;
        case "position":
          checkSelect(positionsSelect);
          break;
      }
    })
  );

  // Search chosen company || position
  const findSelected = function (source, value) {
    return source.find(({ id }) => id === parseInt(value));
  };

  // Update records
  function updateRecords() {
    let recs = JSON.parse(localStorage.getItem("records"));
    recs !== null ? (records = recs) : (records = []);
  }

  // Set localstorage data
  function setLocalStorageRecords(records) {
    localStorage.setItem("records", JSON.stringify(records));
    updateRecords();
  }

  // Render records function
  function renderRecords(records) {
    $.each(records, function (index, value) {
      $(".js-records").append(
        `<tr><td>${value.id}</td><td>${value.lastname}</td><td>${value.firstname}</td><td>${value.email}</td><td>${value.phone}</td><td>${value.company}</td><td>${value.position}</td></tr>`
      );
    });
  }
});
