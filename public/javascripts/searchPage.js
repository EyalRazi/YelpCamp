let currentPriceLabel = document.querySelector("#currentPriceSetting");

let priceRange = document.querySelector(".priceRange");

let val;

priceRange.oninput = function () {
  val = priceRange.value;
  currentPriceLabel.innerHTML = val;
};
