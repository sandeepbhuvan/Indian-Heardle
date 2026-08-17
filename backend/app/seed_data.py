from app.database import SessionLocal, engine, Base
from app.models import Language, Song, DailyChallenge
from datetime import date

LANGUAGES_DATA = [
    {"code": "hi", "display_name": "Hindi (Bollywood)", "native_name": "हिन्दी", "order_index": 1},
    {"code": "ta", "display_name": "Tamil (Kollywood)", "native_name": "தமிழ்", "order_index": 2},
    {"code": "te", "display_name": "Telugu (Tollywood)", "native_name": "తెలుగు", "order_index": 3},
    {"code": "pa", "display_name": "Punjabi Pop", "native_name": "ਪੰਜਾਬੀ", "order_index": 4},
    {"code": "ml", "display_name": "Malayalam (Mollywood)", "native_name": "മലയാളം", "order_index": 5},
    {"code": "kn", "display_name": "Kannada (Sandalwood)", "native_name": "ಕನ್ನಡ", "order_index": 6},
]

SONGS_DATA = [
    # --- Hindi (Bollywood) ---
    {
        "youtube_video_id": "BddP6PYo2gs",
        "title": "Kesariya",
        "artist": "Arijit Singh, Pritam, Amitabh Bhattacharya",
        "movie_or_album": "Brahmastra",
        "release_year": 2022,
        "language_code": "hi",
        "snippet_start_seconds": 65, # Hook starts around "Kesariya tera ishq hai piya"
        "cover_image_url": "https://img.youtube.com/vi/BddP6PYo2gs/maxresdefault.jpg",
        "aliases": ["Kesariya", "Brahmastra", "Arijit Singh Kesariya", "Kesar", "Ishq Hai Piya"]
    },
    {
        "youtube_video_id": "IJq0yyWug1k",
        "title": "Tum Hi Ho",
        "artist": "Arijit Singh, Mithoon",
        "movie_or_album": "Aashiqui 2",
        "release_year": 2013,
        "language_code": "hi",
        "snippet_start_seconds": 60,
        "cover_image_url": "https://img.youtube.com/vi/IJq0yyWug1k/maxresdefault.jpg",
        "aliases": ["Tum Hi Ho", "Aashiqui 2", "Hum Tere Bin", "Kyunki Tum Hi Ho"]
    },
    {
        "youtube_video_id": "JFcgOboQZ08",
        "title": "Channa Mereya",
        "artist": "Arijit Singh, Pritam",
        "movie_or_album": "Ae Dil Hai Mushkil",
        "release_year": 2016,
        "language_code": "hi",
        "snippet_start_seconds": 72,
        "cover_image_url": "https://img.youtube.com/vi/JFcgOboQZ08/maxresdefault.jpg",
        "aliases": ["Channa Mereya", "Ae Dil Hai Mushkil", "Achha Chalta Hoon", "ADHM"]
    },
    {
        "youtube_video_id": "k4yXQkG2s1E",
        "title": "Chaiyya Chaiyya",
        "artist": "Sukhwinder Singh, Sapna Awasthi, A.R. Rahman",
        "movie_or_album": "Dil Se..",
        "release_year": 1998,
        "language_code": "hi",
        "snippet_start_seconds": 45,
        "cover_image_url": "https://img.youtube.com/vi/k4yXQkG2s1E/hqdefault.jpg",
        "aliases": ["Chaiyya Chaiyya", "Dil Se", "Chal Chaiyya Chaiyya", "SRK Train Song"]
    },
    {
        "youtube_video_id": "ru0K8uT53TQ",
        "title": "Kal Ho Naa Ho",
        "artist": "Sonu Nigam, Shankar-Ehsaan-Loy",
        "movie_or_album": "Kal Ho Naa Ho",
        "release_year": 2003,
        "language_code": "hi",
        "snippet_start_seconds": 55,
        "cover_image_url": "https://img.youtube.com/vi/ru0K8uT53TQ/hqdefault.jpg",
        "aliases": ["Kal Ho Naa Ho", "Har Ghadi Badal Rahi Hai", "KHNH"]
    },
    {
        "youtube_video_id": "w_HaezV04eo",
        "title": "Apna Bana Le",
        "artist": "Arijit Singh, Sachin-Jigar",
        "movie_or_album": "Bhediya",
        "release_year": 2022,
        "language_code": "hi",
        "snippet_start_seconds": 50,
        "cover_image_url": "https://img.youtube.com/vi/w_HaezV04eo/maxresdefault.jpg",
        "aliases": ["Apna Bana Le", "Bhediya", "Tu Mera Koyi Na Hoke Bhi"]
    },

    # --- Tamil (Kollywood) ---
    {
        "youtube_video_id": "8FAUEv_E_xQ",
        "title": "Arabic Kuthu (Halamithi Habibo)",
        "artist": "Anirudh Ravichander, Jonita Gandhi",
        "movie_or_album": "Beast",
        "release_year": 2022,
        "language_code": "ta",
        "snippet_start_seconds": 38,
        "cover_image_url": "https://img.youtube.com/vi/8FAUEv_E_xQ/maxresdefault.jpg",
        "aliases": ["Arabic Kuthu", "Halamithi Habibo", "Beast", "Anirudh Arabic Kuthu"]
    },
    {
        "youtube_video_id": "s80e7rW_wM0",
        "title": "Enjoy Enjaami",
        "artist": "Dhee, Arivu, Santhosh Narayanan",
        "movie_or_album": "Single",
        "release_year": 2021,
        "language_code": "ta",
        "snippet_start_seconds": 40,
        "cover_image_url": "https://img.youtube.com/vi/s80e7rW_wM0/maxresdefault.jpg",
        "aliases": ["Enjoy Enjaami", "Dhee Arivu", "Kuku Kuku", "Enjaami"]
    },
    {
        "youtube_video_id": "mU3b2oW_R2c",
        "title": "Naa Ready",
        "artist": "Thalapathy Vijay, Anirudh Ravichander, Asal Kolaar",
        "movie_or_album": "Leo",
        "release_year": 2023,
        "language_code": "ta",
        "snippet_start_seconds": 65,
        "cover_image_url": "https://img.youtube.com/vi/mU3b2oW_R2c/maxresdefault.jpg",
        "aliases": ["Naa Ready", "Leo", "Naa Ready Dhaan Varava", "Vijay Leo Song"]
    },
    {
        "youtube_video_id": "G8UqY7Gv4_w",
        "title": "Rowdy Baby",
        "artist": "Dhanush, Dhee, Yuvan Shankar Raja",
        "movie_or_album": "Maari 2",
        "release_year": 2018,
        "language_code": "ta",
        "snippet_start_seconds": 50,
        "cover_image_url": "https://img.youtube.com/vi/G8UqY7Gv4_w/maxresdefault.jpg",
        "aliases": ["Rowdy Baby", "Maari 2", "Dhanush Sai Pallavi", "En Jodi Manja Kuruvi"]
    },
    {
        "youtube_video_id": "1m0S9h9mN70",
        "title": "Why This Kolaveri Di",
        "artist": "Dhanush, Anirudh Ravichander",
        "movie_or_album": "3",
        "release_year": 2011,
        "language_code": "ta",
        "snippet_start_seconds": 45,
        "cover_image_url": "https://img.youtube.com/vi/1m0S9h9mN70/hqdefault.jpg",
        "aliases": ["Why This Kolaveri Di", "Kolaveri", "Soup Song", "Dhanush Kolaveri"]
    },

    # --- Telugu (Tollywood) ---
    {
        "youtube_video_id": "Os_heh8vPfs",
        "title": "Naatu Naatu",
        "artist": "Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani",
        "movie_or_album": "RRR",
        "release_year": 2022,
        "language_code": "te",
        "snippet_start_seconds": 55,
        "cover_image_url": "https://img.youtube.com/vi/Os_heh8vPfs/maxresdefault.jpg",
        "aliases": ["Naatu Naatu", "Natu Natu", "RRR", "Nacho Nacho", "Oscar Naatu Naatu"]
    },
    {
        "youtube_video_id": "m9wZpXg2pT0",
        "title": "Butta Bomma",
        "artist": "Armaan Malik, Thaman S",
        "movie_or_album": "Ala Vaikunthapurramuloo",
        "release_year": 2020,
        "language_code": "te",
        "snippet_start_seconds": 42,
        "cover_image_url": "https://img.youtube.com/vi/m9wZpXg2pT0/maxresdefault.jpg",
        "aliases": ["Butta Bomma", "Buttabomma", "Ala Vaikunthapurramuloo", "Allu Arjun Butta Bomma"]
    },
    {
        "youtube_video_id": "K18AEzVcCSs",
        "title": "Oo Antava Mava",
        "artist": "Indravathi Chauhan, Devi Sri Prasad",
        "movie_or_album": "Pushpa: The Rise",
        "release_year": 2021,
        "language_code": "te",
        "snippet_start_seconds": 45,
        "cover_image_url": "https://img.youtube.com/vi/K18AEzVcCSs/maxresdefault.jpg",
        "aliases": ["Oo Antava", "Oo Antava Mava", "Pushpa", "Samantha Pushpa Song"]
    },
    {
        "youtube_video_id": "tYq6A1pI3dI",
        "title": "Samajavaragamana",
        "artist": "Sid Sriram, Thaman S",
        "movie_or_album": "Ala Vaikunthapurramuloo",
        "release_year": 2019,
        "language_code": "te",
        "snippet_start_seconds": 50,
        "cover_image_url": "https://img.youtube.com/vi/tYq6A1pI3dI/maxresdefault.jpg",
        "aliases": ["Samajavaragamana", "Sid Sriram Samajavaragamana", "AVPL"]
    },

    # --- Punjabi Pop ---
    {
        "youtube_video_id": "cl0a3i2wFcc",
        "title": "Brown Munde",
        "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        "movie_or_album": "Single",
        "release_year": 2020,
        "language_code": "pa",
        "snippet_start_seconds": 40,
        "cover_image_url": "https://img.youtube.com/vi/cl0a3i2wFcc/maxresdefault.jpg",
        "aliases": ["Brown Munde", "AP Dhillon", "Gurinder Gill", "Desi Hip Hop"]
    },
    {
        "youtube_video_id": "vX2cDW8LUWk",
        "title": "Excuses",
        "artist": "AP Dhillon, Gurinder Gill, Intense",
        "movie_or_album": "Single",
        "release_year": 2020,
        "language_code": "pa",
        "snippet_start_seconds": 38,
        "cover_image_url": "https://img.youtube.com/vi/vX2cDW8LUWk/maxresdefault.jpg",
        "aliases": ["Excuses", "Kehndi Hundi Si", "Chan Tak Raah Bana De", "AP Dhillon Excuses"]
    },
    {
        "youtube_video_id": "dZ0fwJojhrs",
        "title": "295",
        "artist": "Sidhu Moose Wala",
        "movie_or_album": "Moosetape",
        "release_year": 2021,
        "language_code": "pa",
        "snippet_start_seconds": 50,
        "cover_image_url": "https://img.youtube.com/vi/dZ0fwJojhrs/maxresdefault.jpg",
        "aliases": ["295", "Sidhu Moosewala 295", "Dharmi Bano", "Moosetape"]
    },
    {
        "youtube_video_id": "7zp1TbLFPp8",
        "title": "Prada",
        "artist": "Jass Manak",
        "movie_or_album": "Single",
        "release_year": 2018,
        "language_code": "pa",
        "snippet_start_seconds": 35,
        "cover_image_url": "https://img.youtube.com/vi/7zp1TbLFPp8/maxresdefault.jpg",
        "aliases": ["Prada", "Jass Manak Prada", "Suit Patiala"]
    },
    {
        "youtube_video_id": "Nvd4O68vG-o",
        "title": "Lover",
        "artist": "Diljit Dosanjh, Intense",
        "movie_or_album": "MoonChild Era",
        "release_year": 2021,
        "language_code": "pa",
        "snippet_start_seconds": 30,
        "cover_image_url": "https://img.youtube.com/vi/Nvd4O68vG-o/maxresdefault.jpg",
        "aliases": ["Lover", "Diljit Dosanjh Lover", "Moonchild Era"]
    },

    # --- Malayalam (Mollywood) ---
    {
        "youtube_video_id": "W0DO9G3l7X4",
        "title": "Jimikki Kammal",
        "artist": "Vineeth Sreenivasan, Shaan Rahman",
        "movie_or_album": "Velipadinte Pusthakam",
        "release_year": 2017,
        "language_code": "ml",
        "snippet_start_seconds": 45,
        "cover_image_url": "https://img.youtube.com/vi/W0DO9G3l7X4/hqdefault.jpg",
        "aliases": ["Jimikki Kammal", "Entammede Jimikki Kammal", "Velipadinte Pusthakam"]
    },
    {
        "youtube_video_id": "V_y2w7_2F9s",
        "title": "Illuminati",
        "artist": "Sushin Shyam, Dabzee",
        "movie_or_album": "Aavesham",
        "release_year": 2024,
        "language_code": "ml",
        "snippet_start_seconds": 40,
        "cover_image_url": "https://img.youtube.com/vi/V_y2w7_2F9s/maxresdefault.jpg",
        "aliases": ["Illuminati", "Aavesham", "Fahadh Faasil Illuminati", "Sushin Shyam"]
    },

    # --- Kannada (Sandalwood) ---
    {
        "youtube_video_id": "D2Z8G7e3v8E",
        "title": "Singara Siriye",
        "artist": "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath",
        "movie_or_album": "Kantara",
        "release_year": 2022,
        "language_code": "kn",
        "snippet_start_seconds": 50,
        "cover_image_url": "https://img.youtube.com/vi/D2Z8G7e3v8E/maxresdefault.jpg",
        "aliases": ["Singara Siriye", "Kantara", "Rishab Shetty Singara Siriye"]
    },
    {
        "youtube_video_id": "f5k1gOqjD5A",
        "title": "Sulthana",
        "artist": "Ravi Basrur",
        "movie_or_album": "K.G.F: Chapter 2",
        "release_year": 2022,
        "language_code": "kn",
        "snippet_start_seconds": 35,
        "cover_image_url": "https://img.youtube.com/vi/f5k1gOqjD5A/maxresdefault.jpg",
        "aliases": ["Sulthana", "KGF 2", "KGF Chapter 2 Sulthana"]
    }
]

def seed_database():
    """Initializes tables and populates with seed languages and songs."""
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Seed Languages
        print("Seeding languages...")
        for lang_item in LANGUAGES_DATA:
            existing = db.query(Language).filter(Language.code == lang_item["code"]).first()
            if not existing:
                lang = Language(**lang_item)
                db.add(lang)
            else:
                existing.display_name = lang_item["display_name"]
                existing.native_name = lang_item["native_name"]
                existing.order_index = lang_item["order_index"]
        db.commit()

        # Seed Songs
        print("Seeding songs catalog...")
        for song_item in SONGS_DATA:
            existing = db.query(Song).filter(Song.youtube_video_id == song_item["youtube_video_id"]).first()
            if not existing:
                song = Song(**song_item)
                db.add(song)
            else:
                existing.title = song_item["title"]
                existing.artist = song_item["artist"]
                existing.movie_or_album = song_item["movie_or_album"]
                existing.release_year = song_item["release_year"]
                existing.language_code = song_item["language_code"]
                existing.snippet_start_seconds = song_item["snippet_start_seconds"]
                existing.cover_image_url = song_item["cover_image_url"]
                existing.aliases = song_item["aliases"]
        db.commit()

        # Seed initial Daily Challenges for today if not present
        today = date.today()
        for lang in db.query(Language).all():
            existing_challenge = db.query(DailyChallenge).filter(
                DailyChallenge.language_code == lang.code,
                DailyChallenge.date == today
            ).first()
            if not existing_challenge:
                song = db.query(Song).filter(Song.language_code == lang.code).first()
                if song:
                    challenge = DailyChallenge(
                        date=today,
                        language_code=lang.code,
                        song_id=song.id
                    )
                    db.add(challenge)
        db.commit()
        print(f"Successfully seeded database with {len(LANGUAGES_DATA)} languages and {len(SONGS_DATA)} songs!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
