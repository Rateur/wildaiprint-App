# utils/header.py
import streamlit as st

def inject_header(logo_b64: str):
    st.markdown(
        f"""
        <div class='wl-topnav'>
            <img src='data:image/png;base64,{logo_b64}' alt='Logo'>
        </div>
        """,
        unsafe_allow_html=True
    )
