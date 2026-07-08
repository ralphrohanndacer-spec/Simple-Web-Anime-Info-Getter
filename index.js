const baseUrl = "https://kitsu.io/api/edge/anime";
const buttons = [
    document.getElementById("tvBtn"),
    document.getElementById("movieBtn"),
    document.getElementById("ovaBtn")
];
const displayElements = {
    imageResult: document.querySelector("#imageResult"),
    imageDialog: document.querySelector("dialog"),
    dialogContainer: document.querySelector(".dialogContainer"),
    imageUrl: document.getElementById("imageUrl"),
    infoDialog: document.getElementById("infoDialog"),
    infoResult: document.querySelector("#infoResult"),
    infoTitle: document.getElementById("title"),
};
const text = {
    title: document.getElementById("title"),
    engTitle: document.getElementById("engTitle"),
    japTitle: document.getElementById("japTitle"),
    releasedDate: document.getElementById("releasedDate"),
    score: document.getElementById("score"),
    episodes: document.getElementById("episodes"),
    status: document.getElementById("status"),
    malId: document.getElementById("malId"),
    synopsis: document.getElementById("synopsis")
};
let type;


for(let button of buttons){
    button.addEventListener("click", async event => {
        const animeTitle = document.getElementById("titleInput").value.trim();

        if (button.id === "tvBtn") {
            type = "tv";
        }
        else if (button.id === "movieBtn") {
            type = "movie";
        }
        else{
            type = "ova";
        }

        if(animeTitle){
            const params = new URLSearchParams({
                "filter[text]": animeTitle,
                "page[limit]": 10,
            })
            const url = `${baseUrl}?${params.toString()}`
            try{
                button.textContent = "◌";
                displayElements.imageResult.textContent = "◌";
                const data = await getAnimeData(url);
                displayAnimeInfo(data);
            }
            catch(error){
                clearContents();
                displayElements.infoTitle.style.color = "red";
                displayElements.infoTitle.textContent = error.message;
            }
            finally{
                button.textContent = type.toUpperCase();
                displayElements.imageResult.textContent = "";
            }
        }
        else{
            clearContents();
            displayElements.infoTitle.style.color = "red";
            displayElements.infoTitle.textContent = "Enter an anime title first!";
        }
    })
}


displayElements.imageResult.addEventListener("click", event => {
    displayElements.imageDialog.showModal();
})


displayElements.imageDialog.addEventListener("click", (e) => {
    if(!displayElements.dialogContainer.contains(e.target)){
        displayElements.imageDialog.close();
    }
})


async function getAnimeData(url){
    const response = await fetch(url);
    if(!response.ok){
        throw new Error(displayErrorMessage(response.status));
    }
    const data = await response.json();

    const anime = data.data.find(({ attributes }) =>
        attributes.showType?.toLowerCase() === type
    );

    if (!anime){
        throw new Error(`Anime ${type} not found.`);
    }

    //Extract and format data
    return {title: anime.attributes.canonicalTitle ?? "Unavailable",
            engTitle: anime.attributes.titles?.en ?? "Unavailable",
            japTitle: anime.attributes.titles?.ja_jp ?? "Unavailable",
            releasedDate: anime.attributes.startDate ?? "Unavailable",
            score: anime.attributes.averageRating? (Number(anime.attributes.averageRating) / 10).toFixed(2): "Unavailable",
            episodes: anime.attributes.episodeCount ?? "Unavailable",
            status: anime.attributes.status ?? "Unavailable",
            malId: anime.id ?? "Unavailable",
            synopsis: anime.attributes.synopsis ?? "Unavailable",
            imageUrl: anime.attributes.posterImage.original ?? "Unavailable"
    };
}


function displayAnimeInfo(data){
    
    const imageResult = displayElements.imageResult;
    const imageUrl = displayElements.imageUrl;

    if(data.imageUrl !== "Unavailable"){
        document.body.classList.add("setBodyBackgroundImage")
        document.body.style.backgroundImage = `url(${data.imageUrl})`;

        imageResult.classList.add("setElementBackgroundImage");
        imageResult.style.backgroundImage = `url(${data.imageUrl})`;

        imageUrl.href = data.imageUrl;
        imageUrl.target = "_blank";
    }
    else{
        document.body.style.backgroundImage = "";
        imageResult.style.backgroundImage = "";
        imageUrl.href = "";
        imageUrl.target = "_self";
    }

    text.title.textContent = data.title;
    text.title.style.color = "hsl(2, 84%, 57%)";
    text.engTitle.textContent = data.engTitle;
    text.japTitle.textContent = data.japTitle;
    text.releasedDate.textContent = data.releasedDate;
    text.score.textContent = "⭐ " + data.score;
    text.episodes.textContent = data.episodes;
    text.status.textContent = data.status;
    text.malId.textContent = data.malId;
    text.synopsis.textContent = data.synopsis;

    displayElements.infoDialog.innerHTML = displayElements.infoResult.innerHTML;
}


function displayErrorMessage(statusCode){
    displayElements.infoTitle.style.color = "red";
    switch(statusCode){
        case 304:
            return "You have the latest data (Cache Validation response)";
        case 400:
            return "You've made an invalid request. Recheck documentation";
        case 401:
            return "Unauthorized - invalid or no authentication details provided";
        case 404:
            return "The resource was not found.";
        case 406:
            return "Not Acceptable - invalid Accept header";
        case 500:
            return "Server Error";
        default:
            return `HTTP Error Occurred: Status code: ${statusCode}`; 
    }
}


function clearContents(){
    document.body.style.backgroundImage = "";
    document.querySelectorAll(".resultElements span").forEach(span => {
    span.textContent = "";
    });
    displayElements.imageResult.style.backgroundImage = "";
    displayElements.imageUrl.href = "";
    displayElements.imageUrl.target = "_self";
}