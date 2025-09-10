import streamlit as st
from utils.helpers import img_to_base64
from utils.header import inject_header
from pathlib import Path
from styles.custom_style import inject_styles
from styles.custom_background import inject_background
from datetime import datetime

# style
inject_styles()

# images Paths 
ASSETS_DIR = Path(__file__).parent / "assets"
logo_b64 = img_to_base64(ASSETS_DIR / "logo.png")
icon_b64 = img_to_base64(ASSETS_DIR / "logo_vert.png")
bg_b64 = img_to_base64(ASSETS_DIR / "background.png")

# icon page
st.set_page_config(
    page_title="WildAIprint",
    page_icon=f"data:image/png;base64,{icon_b64}",
    layout="wide"
)

# background
inject_background(bg_b64)

# header
inject_header(logo_b64)

# content 
# Initialiser la vue
if "view" not in st.session_state:
    st.session_state.view = "home"

try:
    qp = dict(st.query_params)
    target_view = qp.get("view")
    if target_view in ("home", "capture"):
        st.session_state.view = target_view
except Exception:
    pass

try:
    st.query_params.clear()
except Exception:
    pass

# Affichage selon la vue
view = st.session_state.view

if view == "home":
    st.markdown("""
    <div class="scan-container">
        <div class="wl-photo-btn-container">
            <a href="?view=capture" title="Prendre une photo" aria-label="Prendre une photo">
                <button class="wl-photo-btn"></button>
            </a>
        </div>
        <div class="content-container">
            <p class="scan-text">Upload photo</p>  <p class="scan-desc">Take a photo or choose from gallery to identify animal tracks</p> 
            <button class="identify-btn"> Identify track </button> 
        </div> 
    </div>
    """, unsafe_allow_html=True)

elif view == "capture":
    t1, t2 = st.tabs(["Prendre une photo", "Importer une image"])

    with t1:
        cam_img = st.camera_input("Prendre une photo")
        if cam_img is not None:
            st.session_state.image_bytes = cam_img.getvalue()
            st.session_state.capture_ts = datetime.now().isoformat(timespec="seconds")
            st.image(cam_img, caption="Aperçu", use_container_width=True)

    with t2:
        up = st.file_uploader( "Importer une image",
            type=["png", "jpg", "jpeg", "webp"],
            accept_multiple_files=False,
        )
        if up is not None:
            st.session_state.image_bytes = up.getvalue()
            st.session_state.capture_ts = datetime.now().isoformat(timespec="seconds")
            st.image(up, caption="Aperçu", use_container_width=True)