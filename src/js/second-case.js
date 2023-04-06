import "../styles/second-case-styling.scss";
import IMAGES from "./gallery-items.js";

const result = document.getElementById("gallery-list");

IMAGES.forEach((i) => {
  const new_figure = document.createElement("figure");
  new_figure.classList = "gallery-figure gallery-list__item";

  const new_img = new Image();
  new_img.src = i.src;
  new_img.alt = i.description;
  new_img.classList = "gallery-figure__image gallery-list__item-image";

  new_figure.appendChild(new_img);

  const new_figcaption = document.createElement("figcaption");
  new_figcaption.classList = "gallery-figure__figcaption";
  new_figcaption.innerText = `${i.description}`;
  new_figure.appendChild(new_figcaption);

  result.appendChild(new_figure);
});

const items = document.querySelectorAll(".gallery-filter__item");
const filter = document.querySelector(".js-filter");

filter.addEventListener("click", (e) => {
  if (e.target && e.target.matches("li")) {
    items.forEach((el) => el.classList.remove("gallery-filter__item--active"));
    e.target.classList.add("gallery-filter__item--active");

    result.classList = "gallery-list";
    // result.classList.remove("gallery-list--three-columns");
    result.classList.add(`gallery-list--${e.target.dataset.columns}-columns`);
  }
});
