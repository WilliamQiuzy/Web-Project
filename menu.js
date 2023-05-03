"use strict;"

const food = document.getElementById("food");
food.addEventListener("click", jump1);

function jump1() {
    window.location.href = "#cf";
}

const build = document.getElementById("build");
build.addEventListener("click", jump2);

function jump2() {
    window.location.href = "#cf1";
}

const pai = document.getElementById("pai");
pai.addEventListener("click", jump3);

function jump3() {
    window.location.href = "#cf2";
}

let left = document.querySelector(".button-left");
let right = document.querySelector(".button-right");
let min = document.querySelectorAll(".min");
let images = document.querySelector(".images");
let index = 0;
let time;
function position() {
    images.style.left = (index * -100) + "%";
}
function add() {
    if (index >= min.length - 1) {
        index = 0;
    } else {
        index++;
    }
}
function desc() {
    if (index < 1) {
        index = min.length - 1;
    } else {
        index--;
    }
}

function timer() {
    time = setInterval(() => {
        index++
        desc()
        add()
        position()
    }, 34000)
}

left.addEventListener("click", () => {
    desc()
    position()
    clearInterval(time)
    timer()
})

right.addEventListener("click", () => {
    add()
    position()
    clearInterval(time)
    timer()
})

for (let i = 0; i < min.length; i++) {
    min[i].addEventListener("click", () => {
        index = i
        position()
        clearInterval(time)
        timer()
    })
}

timer()

