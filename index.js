import { posts } from "./csts.js"

const isMobView = window.matchMedia("(max-width: 768px)").matches
const isTabView = window.matchMedia(
  "(min-width: 769px) and (max-width: 1024px)"
).matches

/* DARK MODE */
const brightnessBtn = document.querySelector("#brightness-btn")
brightnessBtn.addEventListener("click", () => {
  const elIds = [
    "body",
    "code",
    "iframe.gist-iframe",
    ".bio a",
    ".post .timestamp",
    ".bio img.brightness-btn",
    ".bio img.pfp",
  ]
  toggleMode(elIds)
  if (brightnessBtn.innerHTML.trim() == "🌞") {
    brightnessBtn.innerHTML = "🌚"
  } else {
    brightnessBtn.innerHTML = "🌞"
  }
})

function toggleMode(elIds) {
  for (const elId of elIds) {
    for (const el of document.querySelectorAll(elId)) {
      el.classList.toggle("dark-mode")
    }
  }
}

function setPosts() {
  const columns = document.querySelectorAll(".column")

  let i = 0
  for (const post of posts) {
    const postDiv = document.createElement("div")
    postDiv.classList.add("post")
    postDiv.innerHTML = post
    if (isMobView) columns[0].append(postDiv)
    else if (isTabView) columns[i % 2].append(postDiv)
    else columns[i % 3].append(postDiv)
    i++
  }

  const postImgs = document.querySelectorAll(".post img")
  for (const postImg of postImgs) {
    postImg.addEventListener("click", () => {
      window.open(postImg.src, "_blank")
    })
  }
}

function runPostScripts() {
  const posts = document.querySelectorAll(".post")

  posts.forEach((post) => {
    const gistScripts = post.querySelectorAll('script[src*="gist.github.com"]')

    gistScripts.forEach((oldScript) => {
      const gistUrl = oldScript.src
      const iframe = document.createElement("iframe")
      iframe.style.border = "none"
      iframe.style.width = "100%"
      iframe.style.margin = "15px 0"
      iframe.classList.add("gist-iframe")

      // Auto-adjust height
      iframe.onload = () => {
        const iframeDoc = iframe.contentWindow.document
        const body = iframeDoc.body
        if (body) {
          iframe.style.height = body.scrollHeight - 37 + "px"
        }

        // Hide the .gist-meta element
        const style = iframeDoc.createElement("style")
        style.textContent = `.gist-meta { display: none !important; }`
        iframeDoc.head.appendChild(style)
      }

      const iframeContent =
        `
          <html>
            <head>
              <base target="_parent">
              <style>
                body { margin: 0; }
              </style>
            </head>
            <body>
              <script type="text/javascript" src="${gistUrl}"></` +
        `script>
            </body>
          </html>
        `

      oldScript.parentNode.replaceChild(iframe, oldScript)

      const iframeDoc = iframe.contentWindow.document
      iframeDoc.open()
      iframeDoc.write(iframeContent)
      iframeDoc.close()
    })
  })

  //   // Create a new <link> element to load the CSS
  //   var link = document.createElement("link")
  //   link.rel = "stylesheet"
  //   link.href =
  //     "https://cdn.rawgit.com/lonekorean/gist-syntax-themes/b737b139/stylesheets/terminal.css"

  //   // Append the link element to the <head> of the document
  //   document.head.appendChild(link)
}

function init() {
  setPosts()
  runPostScripts()
}

init()
