import IMask from "imask";
import EValidator from "email-validator";
import select2 from "select2";
import "select2/dist/js/i18n/ru";
import "select2/dist/css/select2.css";
import "../styles/third-case-styling.scss";
import companiesRegistry from "./companies-registry";

const phoneInput = $("#phone");
const emailInput = $("#email");
const firstnameInput = $("#firstname");
const lastnameInput = $("#lastname");
const companySelect = $(".js-company-select");
const positionsSelect = $(".js-position-select");

let companyStuff = [];

let CURRENT_RECORD = {
  id: null,
  firstname: null,
  lastname: null,
  email: null,
  phone: null,
  company: null,
  position: null,
};

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
  $(this).next().next().empty();
  const value = $(".js-position-select").val();
  const selectedPosition = findSelected(CURRENT_RECORD.company.stuff, value);
  console.log(selectedPosition);
  CURRENT_RECORD.position = selectedPosition;
});

// Mask phone number input
const phoneMaskOptions = {
  mask: "+{7} (000) 000-00-00",
};
const phoneMask = IMask(phoneInput[0], phoneMaskOptions);
phoneMask.on("complete", function () {
  phoneInput.next().empty();
});

// Prevent submitting by Enter
$(".js-form").on("keyup keypress", function (e) {
  var keyCode = e.key || e.which;
  if (keyCode === "Enter") {
    e.preventDefault();
    return false;
  }
});

// Clear errors
emailInput.on("input", () => {
  $(this).next().empty();
});

firstnameInput.on("input", () => {
  $(this).next().empty();
});

lastnameInput.on("input", () => {
  $(this).next().empty();
});

companySelect.on("change", () => {
  companySelect.next().next().empty();
});

positionsSelect.on("change", () => {
  positionsSelect.next().next().empty();
});

//Handle submitting
$(".js-form").on("submit", (e) => {
  e.preventDefault();

  CURRENT_RECORD = {
    id: records.length + 1,
    phone: phoneInput.val(),
    email: emailInput.val(),
    firstname: firstnameInput.val(),
    lastname: lastnameInput.val(),
    company: CURRENT_RECORD?.company?.company_name || null,
    position: CURRENT_RECORD?.position?.position || null,
  };

  let errors = [];

  // Form elements validation
  if (CURRENT_RECORD.phone == "" || phoneMask.value.length < 18) {
    errors.push(phoneInput.attr("id"));
    phoneInput.next().text("Неверный номер");
  }

  if (!EValidator.validate($("#email").val())) {
    errors.push(emailInput.attr("id"));
    emailInput.next().text("Неверный адрес");
  }

  if (CURRENT_RECORD.firstname == "") {
    errors.push(firstnameInput.attr("id"));
    firstnameInput.next().text("Поле не может быть пустым");
  }

  if (CURRENT_RECORD.lastname == "") {
    errors.push(lastnameInput.attr("id"));
    lastnameInput.next().text("Поле не может быть пустым");
  }

  if (!CURRENT_RECORD.company) {
    errors.push(companySelect.attr("id"));
    companySelect.next().next().text("Компания не выбрана");
  }

  if (!CURRENT_RECORD.position) {
    errors.push(positionsSelect.attr("id"));
    positionsSelect.next().next().text("Должность не выбрана");
  }

  if (errors.length) {
    return;
  }

  // Send current record to localstorage
  records.push(CURRENT_RECORD);
  setLocalStorageRecords(records);

  // Rerender current record
  $(".js-records").append(
    `<tr><td>${CURRENT_RECORD.id}</td><td>${CURRENT_RECORD.lastname}</td><td>${CURRENT_RECORD.firstname}</td><td>${CURRENT_RECORD.email}</td><td>${CURRENT_RECORD.phone}</td><td>${CURRENT_RECORD.company}</td><td>${CURRENT_RECORD.position}</td></tr>`
  );

  $(".js-form").find("input").val("");
  companySelect.html("<option></option>").select2(companySelectOptions);
  positionsSelect.html("<option></option>");

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
