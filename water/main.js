function getRandom(min = 10, max = 50) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomColor() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

const randomEleArr = [];
for (let index = 0; index < 300; index++) {
  randomEleArr.push({ color: getRandomColor() });
}

const parentNode = document.querySelector(".box"),
  vw = document.documentElement.clientWidth,
  cloumnNum = 7,
  columnWidth = vw / cloumnNum,
  heightList = [],
  padding = 10,
  gap = 10;
randomEleArr.forEach((ele, idx) => {
  const { color } = ele;
  const li = document.createElement("li");
  li.classList.add("item");
  li.setAttribute("idx", idx + "");
  li.style.cssText = `width:${columnWidth - gap}px;`;

  const img = new Image();
  img.src = `imgs/${getRandom(1, 4)}.png`;
  img.alt = "";
  img.style.backgroundColor = `${color}`;
  const contentLength = columnWidth - (padding * 2 + gap + 2);
  img.height = contentLength;
  img.width = contentLength;
  const span = document.createElement("span");
  span.textContent = "Description: " + Array(getRandom()).fill("x").join("");
  li.append(img, span);
  parentNode.append(li);
  if (idx < cloumnNum) {
    li.style.left = `${idx * columnWidth}px`;
    li.style.top = "0";
    heightList.push(li.offsetHeight);
  } else {
    let minHeight = heightList[0];
    let markIdx = 0;
    for (let index = 1; index <= heightList.length; index++) {
      if (heightList[index] < minHeight) {
        minHeight = heightList[index];
        markIdx = index;
      }
    }
    li.style.left = `${markIdx * columnWidth}px`;
    li.style.top = `${heightList[markIdx] + gap}px`;
    heightList[markIdx] && (heightList[markIdx] += li.offsetHeight + gap);
  }
});
