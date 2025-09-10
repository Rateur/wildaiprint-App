import streamlit as st

def inject_background(bg_b64):
    # Inject dynamic CSS
    if bg_b64:
        st.markdown(
            f"""
            <style>
            .stApp {{
                background-image: url("data:image/png;base64,{bg_b64}");
                background-size: cover;
                background-position: bottom center;
                background-attachment: fixed;
            }}
            </style>
            """,
            unsafe_allow_html=True
        )
