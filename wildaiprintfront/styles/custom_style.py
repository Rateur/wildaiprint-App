import streamlit as st

def inject_styles(bg_b64=None):
    # Inject static CSS
    with open("styles/custom_style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
