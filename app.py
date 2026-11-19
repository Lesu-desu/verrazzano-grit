import os

from flask import Flask, render_template

from projects import get_projects, get_walkthrough, get_media, get_home_gallery, get_clients

app = Flask(__name__)

# Contact details. The contact form's "Email" and "WhatsApp" buttons use these,
# so there is no mail server and no .env file to set up.
CONTACT = {
    "email": "info@verrazzanoandgrit.com.ng",
    "phone": "+234 805 553 3646",     # as shown on the page
    "whatsapp": "2348055533646",      # digits only: country code first, no +, no spaces, no leading 0
}

# Reload templates when they change, and add a version tag to static file links
# (?v=<last-modified>) so the browser never serves an old CSS or JS file.
app.config["TEMPLATES_AUTO_RELOAD"] = True


@app.context_processor
def static_helpers():
    def static_v(filename):
        try:
            return int(os.path.getmtime(os.path.join(app.static_folder, filename)))
        except OSError:
            return 0

    return {"static_v": static_v, "contact": CONTACT}


@app.route("/")
def index():
    return render_template(
        "index.html",
        home_gallery=get_home_gallery(),
        clients=get_clients(),
    )


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/portfolio")
def portfolio():
    projects = get_projects()
    completed = [p for p in projects if not p.get("concept")]
    concepts = [p for p in projects if p.get("concept")]
    featured = next((p for p in completed if p.get("featured")), completed[0] if completed else None)
    others = [p for p in completed if p is not featured]

    # Films: the featured walkthrough first, then each project's own video.
    # A file already used by the walkthrough is not listed twice.
    films, seen = [], set()
    wt = get_walkthrough()
    if wt["ready"]:
        films.append({"src": wt["file"], "youtube": wt["youtube"], "poster": wt["poster_url"],
                      "title": wt["label"], "where": ""})
        if wt["file"]:
            seen.add(wt["file"])
    for p in completed:
        for v in p["videos"]:
            if v in seen:
                continue
            seen.add(v)
            films.append({"src": v, "youtube": "", "poster": p["images"][0],
                          "title": p["name"], "where": p["location"]})

    return render_template(
        "portfolio.html",
        projects=projects,          # everything, for the gallery script
        featured=featured,
        others=others,
        concepts=concepts,
        films=films,
        media=get_media(),
    )


@app.route("/services")
def services():
    return render_template("services.html")


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)