"""
Portfolio data for Verrazzano & Grit.

EXACT MEDIA MAPPING
-------------------
All images and videos live in  static/portfolio/

Photos:
- 1.jpg to 6.jpg    -> Mainstreet Capital (Corporate Office Fit-Out)
- 7.jpg to 12.jpg   -> Shoe Store (Retail Fit-Out Boutique)
- 13.jpg to 18.jpg  -> Security Surveillance Room (24/7 Operations)   (19.jpg and 20.jpg were deleted)
- 21.jpg to 24.jpg  -> Residential House (Life Camp, Abuja)
- 25.jpg            -> Luxury Kitchen & Joinery Fit-Out (Ikoyi, Lagos)
- 26.jpg            -> Commercial Reception & Lobby Outfitting (VI, Lagos)
- 27.jpg            -> Contemporary Villa Living Fit-Out (Maitama, Abuja)
- 28.jpg            -> Executive Boardroom Turnkey Fit-Out (Abuja)
- 29.jpg to 32.jpg  -> Lekki Residence
- 34.jpg to 41.jpg  -> Bolt HQ                                         (33.jpg is not used)

Videos:
- mainstreet.mp4    -> Mainstreet Capital
- tour.mp4          -> Residential House & Featured Site Walkthrough
- security.mp4      -> Security Surveillance Room
- Projects without a video (Shoe Store, Lekki Residence, Bolt HQ) simply use "videos": []
  and show no film link or film card.
- A video listed below but missing from static/media/ is skipped automatically, so the
  Films section only ever shows the videos you really have.
"""

IMAGE_URL = "/static/media/"     # URL path of the media folder
MEDIA_DIR = "media"              # folder under static/


import os

_STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", MEDIA_DIR)


def _video_exists(name):
    """Local video files must exist in static/<MEDIA_DIR>/ to be shown.
    Full URLs (http/https or a leading /) are trusted as they are."""
    if name.startswith(("/", "http://", "https://")):
        return True
    return os.path.isfile(os.path.join(_STATIC_DIR, name))


GROUPS = [
    "Office & Institutional",
    "Retail & Hospitality",
    "Residential",
    "Technical",
]

# Page-wide hero & closing CTA background images
HERO_IMAGE = "1.jpg"      # Mainstreet Capital flagship photo
CTA_IMAGE = "26.jpg"     # Commercial reception outfitting photo

# Walkthrough video section on the portfolio page
WALKTHROUGH = {
    "youtube": "",
    "file": "tour.mp4",        # Video file inside static/portfolio/
    "poster": "21.jpg",        # Still preview image before clicking play
    "label": "Featured Walkthrough",
}

# ---------------------------------------------------------------
# HOME PAGE: the scroll gallery in the "Selected work" section.
# Order here is the order on the page. Add or remove lines freely;
# the slide count and the "01 / 06" counter follow automatically.
# Images live in static/media/ (same folder as the portfolio photos).
# ---------------------------------------------------------------
HOME_GALLERY = [
    # EDIT the category and title of each line so they describe the photo.
    {"image": "42.jpg", "category": "INTERIOR DESIGN",        "title": "Interior Spaces"},
    {"image": "43.jpg", "category": "CONSTRUCTION MANAGEMENT", "title": "Workplace Fit-out"},
    {"image": "44.jpg", "category": "INTERIOR DESIGN",        "title": "Residential Interiors"},
    {"image": "45.jpg", "category": "FURNITURE PRODUCTION",   "title": "Bespoke Joinery"},
    {"image": "46.jpg", "category": "CONSTRUCTION MANAGEMENT", "title": "Finished Spaces"},
    {"image": "30.jpg", "category": "INTERIOR DESIGN",        "title": "Lekki Residence"},
]

# ---------------------------------------------------------------
# HOME PAGE: client marquee under the gallery ("who we worked for").
# EDIT: add every client you are happy to name. The strip repeats
# the names automatically, so even a short list fills the width.
# ---------------------------------------------------------------
CLIENTS = [
    "Bolt",
    "Moniepoint",
    "PricewaterhouseCoopers",
    "Infinera Agribusiness Ltd",
    "Quanteq Technology",
    "Nigerstar 7",
    "Ibile Holdings",
    "Zephr Training Center",
    "Whanedoe",
    "ATC",
    "Meed Networks",
    "Kitchen Muse",
    "Mainstreet Capital",
    "YF Construction",
    "SERPLAT",
    "Athena Centre",
    "FCTA",
    "VIO",
    "One Kobo Technologies",
    "Kids & Bibs Preparatory",
    "Kids & Bibs Pre-school",
    "Private Homes",
    "Private Shops",
]

PROJECTS = [
    {
        "name": "Mainstreet Capital",
        "category": "Corporate Fit-Out & Furnishing",
        "group": "Office & Institutional",
        "location": "Abuja",
        "images": [f"{i}.jpg" for i in range(1, 7)],
        "videos": ["mainstreet.mp4"],
        "desc": "Complete corporate office turnkey fit-out with bespoke executive desks, boardroom furniture, and custom workstations.",
        "featured": True,
    },
    {
        "name": "Shoe Store",
        "category": "Retail Fit-Out",
        "group": "Retail & Hospitality",
        "location": "Jahi, Abuja",
        "images": [f"{i}.jpg" for i in range(7, 13)],
        "videos": [],  # no video; to add one later: ["shoestore.mp4"]
        "desc": "Custom retail display units, modular shelving systems, integrated display lighting, and customer seating for a luxury footwear boutique.",
    },
    {
        "name": "Security Surveillance Room",
        "category": "Technical Outfitting",
        "group": "Technical",
        "location": "Abuja, FCT",
        "images": [f"{i}.jpg" for i in range(13, 19)],
        "videos": ["security.mp4"],
        "desc": "Ergonomic control room workstations, specialized equipment housing, monitoring consoles, and cable management for 24/7 operations.",
    },
    {
        "name": "Residential House",
        "category": "Residential Fit-Out & Joinery",
        "group": "Residential",
        "location": "Life Camp, Abuja",
        "images": [f"{i}.jpg" for i in range(21, 25)],
        "videos": ["tour.mp4"],
        "desc": "Full turnkey residential interior outfitting, bespoke cabinetry, customized bedroom suites, and architectural woodwork.",
    },
    {
        "name": "Lekki Residence",
        "category": "Residential Fit-Out & Joinery",
        "group": "Residential",
        "location": "Lekki, Lagos",
        "images": [f"{i}.jpg" for i in range(29, 33)],
        "videos": [],
        "desc": "Residential interior fit-out with custom joinery and furnishing.",   # EDIT: describe the actual work
    },
    {
        "name": "Bolt HQ",
        "category": "Corporate Fit-Out & Furnishing",
        "group": "Office & Institutional",
        "location": "",   # EDIT: add the city, e.g. "Lagos". Leave empty to show no location line.
        "images": [f"{i}.jpg" for i in range(34, 42)],
        "videos": [],
        "desc": "Corporate headquarters office fit-out and furnishing.",   # EDIT: describe the actual work
    },
    {
        "name": "Executive Boardroom Fit-Out",
        "concept": True,   # AI-generated visualisation, shown in its own section
        "category": "Construction Management & Fit-Out",
        "group": "Office & Institutional",
        "location": "Central Business District, Abuja",
        "images": ["28.jpg"],
        "videos": [],
        "desc": "Turnkey post-shell commercial outfitting: acoustic fluted wall paneling, architectural recessed linear lighting, and custom conference table joinery.",
    },
    {
        "name": "Luxury Kitchen & Joinery Installation",
        "concept": True,   # AI-generated visualisation, shown in its own section
        "category": "Bespoke Joinery & Fit-Out",
        "group": "Residential",
        "location": "Ikoyi, Lagos",
        "images": ["25.jpg"],
        "videos": [],
        "desc": "Full interior finishing and cabinetry outfitting, featuring dark fluted timber joinery, waterfall marble island, and precision appliance integration.",
    },
    {
        "name": "Commercial Reception & Lobby Outfitting",
        "concept": True,   # AI-generated visualisation, shown in its own section
        "category": "Construction Management & Fit-Out",
        "group": "Office & Institutional",
        "location": "Victoria Island, Lagos",
        "images": ["26.jpg"],
        "videos": [],
        "desc": "Comprehensive turnkey lobby finishing: curved fluted reception counter, acoustic wood baffle ceiling, and architectural terrazzo flooring installation.",
    },
    {
        "name": "Contemporary Villa Living Fit-Out",
        "concept": True,   # AI-generated visualisation, shown in its own section
        "category": "Interior Finishing & Outfitting",
        "group": "Residential",
        "location": "Maitama, Abuja",
        "images": ["27.jpg"],
        "videos": [],
        "desc": "Post-shell interior outfitting including floating architectural credenza, custom timber wall cladding, and indirect cove lighting systems.",
    },
]


def get_projects():
    """Returns projects with fully resolved media URLs."""
    out = []
    for i, p in enumerate(PROJECTS):
        item = dict(p)
        item["id"] = i
        photo_urls = [
            IMAGE_URL + img if not img.startswith(("/", "http://", "https://")) else img
            for img in p.get("images", [])
        ]
        video_urls = [
            IMAGE_URL + vid if not vid.startswith(("/", "http://", "https://")) else vid
            for vid in p.get("videos", [])
            if _video_exists(vid)          # a video file that is not there is simply not shown
        ]
        item["images"] = photo_urls
        item["videos"] = video_urls
        item["media"] = (
            [{"src": s, "type": "image"} for s in photo_urls]
            + [{"src": s, "type": "video"} for s in video_urls]
        )
        out.append(item)
    return out


def get_walkthrough():
    """Returns the featured walkthrough metadata."""
    w = dict(WALKTHROUGH)
    poster = w.get("poster", "")
    if poster and not poster.startswith(("/", "http://", "https://")):
        w["poster_url"] = IMAGE_URL + poster
    else:
        w["poster_url"] = poster

    video_file = w.get("file", "")
    if video_file and not _video_exists(video_file):
        video_file = ""                    # walkthrough file missing: hide the walkthrough card
    if video_file and not video_file.startswith(("/", "http://", "https://")):
        w["file"] = IMAGE_URL + video_file
    else:
        w["file"] = video_file

    w["ready"] = bool(w.get("youtube") or w.get("file"))
    return w


def get_media():
    """Returns site-wide media like hero and CTA backgrounds."""
    hero = HERO_IMAGE
    if hero and not hero.startswith(("/", "http://", "https://")):
        hero = IMAGE_URL + hero
    cta = CTA_IMAGE
    if cta and not cta.startswith(("/", "http://", "https://")):
        cta = IMAGE_URL + cta
    return {"hero": hero, "cta": cta}


def get_home_gallery():
    """Home page gallery slides with resolved image URLs."""
    out = []
    for item in HOME_GALLERY:
        img = item["image"]
        if not img.startswith(("/", "http://", "https://")):
            img = IMAGE_URL + img
        out.append({"src": img, "category": item["category"], "title": item["title"]})
    return out


def get_clients():
    """Client names for the home page marquee."""
    return [c for c in CLIENTS if c and c.strip()]