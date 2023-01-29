let wrapper_div = document.querySelector("#wrapper-div");

const tablet_breakpoint = window.matchMedia("(max-width: 768px)");

const cover_container_remover = (breakpoint) => {
  if (breakpoint.matches) {
    wrapper_div.classList.replace("cover-container", "container");
  } else {
    wrapper_div.classList.replace("container", "cover-container");
  }
};

cover_container_remover(tablet_breakpoint);
tablet_breakpoint.addListener(cover_container_remover);
