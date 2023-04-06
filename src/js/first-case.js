import "../styles/first-case-styling.scss";
import IMAGES from "./gallery-items.js";

let images = IMAGES.slice(0);

const result = document.getElementById("gallery-list");

renderList(images, result);

function filterList(val, images) {
  let result = [];
  return images.filter((e) => e.tag == val);
}

function renderList(_list = [], result) {
  _list.forEach((i) => {
    const new_figure = document.createElement("figure");
    new_figure.classList = "gallery-list__item";

    const new_img = new Image();
    new_img.src = i.src;
    new_img.alt = i.description;
    new_img.classList = "gallery-list__item-image";

    new_figure.appendChild(new_img);

    result.appendChild(new_figure);
  });
}

const items = document.querySelectorAll(".gallery-filter__item");

document.querySelector(".js-filter").addEventListener("click", (e) => {
  if (e.target && e.target.matches("li")) {
    items.forEach((el) => el.classList.remove("gallery-filter__item--active"));
    e.target.classList.add("gallery-filter__item--active");

    result.innerHTML = "";
    let new_arr;

    if (e.target.dataset.filter == "any") {
      new_arr = IMAGES;
    } else {
      new_arr = filterList(e.target.dataset.filter, images);
    }

    renderList(new_arr, result);
  }
});
