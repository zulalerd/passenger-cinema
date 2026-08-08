/* ==========================================================================
   PASSENGER CINEMA / EVENT DATA
   --------------------------------------------------------------------------
   This is the only file you need to edit to add a screening.
   Every page on the site reads from here.

   TO ADD AN UPCOMING SCREENING
     Add an object to PC.upcoming (newest first).

   TO MOVE A SCREENING INTO THE ARCHIVE once it has happened
     Cut it from PC.upcoming, paste it at the TOP of PC.past,
     then add `attendance`, `story`, `beyondBody`, `credits` and `photos`.

   PHOTOS
     Put JPEGs in  assets/img/events/  and list the filenames.
     The first photo in the list is used as the cover image.

   Dates are ISO: "2026-08-23". Keep them accurate: the site sorts on them.
   Anything with a `confirm:` note still needs checking before you publish.
   ========================================================================== */

window.PC = {

  /* ------------------------------------------------------------------ */
  /*  UPCOMING                                                          */
  /* ------------------------------------------------------------------ */
  upcoming: [
    {
      slug: "saz-the-key-of-trust",
      film: "Saz: The Key of Trust",
      director: "Petra Nachtmanova",
      code: "TR",
      country: "Turkey / Germany",
      destinationCode: "IE",
      destinationCountry: "Ireland",
      year: null,
      date: "2026-08-23",
      doors: "16:00",
      start: "16:30",
      ends: "20:30",
      venue: "The Dot Theatre",
      city: "Dublin",
      ticketUrl: "https://thedot.ie/events/a744a95f-a6c9-465f-8e4d-cd1719f89189",
      ticketLabel: "Get tickets",
      standfirst:
        "Our first ever event outside London. A documentary that follows the saz " +
        "from Berlin to Horasan, followed by live music from Dublin duo Mavi Duo.",
      body: [
        "Join us for a special afternoon celebrating music, culture and connection with " +
        "<em>Saz: The Key of Trust</em>, a documentary that follows musician and ethnomusicologist " +
        "Petra Nachtmanova on an extraordinary journey from Berlin to Horasan in search of the saz, " +
        "an instrument that has travelled across borders for centuries.",
        "Travelling across countries and generations, Petra meets musicians, instrument makers and " +
        "communities whose lives have been shaped by the saz.",
        "Following the screening we will continue the journey through live music with Dublin-based " +
        "musicians Ceren and Mert of Mavi Duo. Drawing on rich musical traditions and contemporary " +
        "influences, their performance will bring many of the sounds and stories explored in the film " +
        "to life, creating a bridge between the screen and the stage.",
        "This will be our first event in Dublin and we look forward to travelling together."
      ],
      runningOrder: [
        ["16:00", "Doors open"],
        ["16:30", "Screening of Saz: The Key of Trust"],
        ["18:30", "Live performance by Mavi Duo"]
      ],
      beyond: "Live performance by Mavi Duo (Ceren and Mert)",
      photos: []
    }
  ],

  /* ------------------------------------------------------------------ */
  /*  PAST, newest first                                                */
  /* ------------------------------------------------------------------ */
  past: [
    {
      slug: "the-cook-the-thief",
      film: "The Cook, the Thief, His Wife & Her Lover",
      director: "Peter Greenaway",
      code: "GB",
      country: "United Kingdom",
      year: 1989,
      date: "2026-06-07",
      venue: "Barcelona",
      city: "Barcelona",
      attendance: null,
      standfirst:
        "British cinema exported. A screening and a culinary experience built with " +
        "Barcelona community builders and food creatives.",
      story: [
        "Passenger Cinema usually brings the world to London. In Barcelona we did the reverse: " +
        "we brought British cinema to a Spanish audience.",
        "Greenaway's film is set almost entirely around a restaurant table, so the evening was " +
        "built around one too. We worked with local community builders and food creatives to design " +
        "a culinary experience alongside the screening, with the meal and the film reading each other."
      ],
      beyond: "Culinary experience inspired by the film",
      credits: ["Barcelona community builders and food creatives"],
      photos: [],
      confirm: "Date taken from planning documents. Confirm before publishing, and add photos."
    },
    {
      slug: "gabbeh",
      film: "Gabbeh",
      director: "Mohsen Makhmalbaf",
      code: "IR",
      country: "Iran",
      year: 1996,
      date: "2026-05-16",
      venue: "Rhizomatic",
      city: "Hackney Wick, London",
      attendance: 40,
      soldOut: true,
      standfirst:
        "A film woven from carpets, screened in a craft cafe on its opening weekend, " +
        "followed by weaving and natural dye workshops that ran for hours.",
      story: [
        "In the months before this screening, many of our Iranian friends had spent days and nights " +
        "worrying about their homeland and loved ones back home, first through the protests in Iran " +
        "and then through the war.",
        "At a time when headlines were dominated by fear and conflict, we wanted to tell a different " +
        "story: one of beauty, creativity and shared humanity. We wanted to organise an event that " +
        "celebrated Iranian culture and brought people together through cinema rather than division, " +
        "as an act of solidarity.",
        "We partnered with Rhizomatic London, a new third space founded by Meryl Prendergast, who had " +
        "personally funded and renovated the space with volunteer support from the queer community. " +
        "Through Meryl we met Iranian woven textile designer Misha Nikkhah, who introduced us to " +
        "<em>Gabbeh</em>. The film, inspired by the vibrant woven carpets of southern Iran, felt like " +
        "the perfect choice. Misha then joined forces with our friend Zeynep Ağırbaş, " +
        "a knitwear designer whose work explores Anatolian weaving traditions, to develop workshops " +
        "inspired by the film.",
        "All 40 tickets sold within two days, with a waiting list of thirteen. More than half of the " +
        "people in the room had never been to a Passenger Cinema event before, and most of them " +
        "arrived through Rhizomatic, through Misha, and through local Iranian networks rather than " +
        "our own channels.",
        "What made it different from our usual screenings was how many people shaped it. Rather than " +
        "programming a film and inviting people to watch it, we brought together designers, artists, " +
        "volunteers and audience members to create an evening that felt collectively made."
      ],
      beyondTitle: "Beyond the screen",
      beyondBody: [
        "Rhizomatic is a craft cafe, not a cinema, so turning it into a screening space became part of " +
        "the experience. Volunteers covered the large windows to darken the room. Meryl provided her own " +
        "projector and turned a simple white sheet into a screen. A friend brought a sound system. One " +
        "friend transported weaving looms from Turkey so that more guests could take part.",
        "After the screening, almost the entire audience stayed for weaving and natural dye workshops " +
        "led by Misha and Zeynep. Tables were covered with yarn, patterns, looms and dyeing materials. " +
        "Participants learnt about the symbolism of carpets, tried basic weaving techniques and " +
        "experimented with natural dyes. People who had arrived as strangers spent hours sitting " +
        "together, weaving, talking and sharing stories."
      ],
      beyond: "Weaving and natural dye workshops",
      impact: [
        ["40", "tickets, sold out in two days"],
        ["13", "people on the waiting list"],
        ["50%+", "first-time Passenger visitors"],
        ["~100", "new followers in the weeks around it"]
      ],
      credits: [
        "Rhizomatic London, venue partner (Meryl Prendergast)",
        "Misha Nikkhah, woven textile designer and workshop lead",
        "Zeynep Ağırbaş, knitwear designer and workshop lead",
        "8 core volunteers plus 4 friends who lent equipment and expertise"
      ],
      photos: [
        "gabbeh-01.jpg", "gabbeh-02.jpg", "gabbeh-03.jpg", "gabbeh-04.jpg",
        "gabbeh-05.jpg", "gabbeh-06.jpg", "gabbeh-07.jpg", "gabbeh-08.jpg",
        "gabbeh-09.jpg"
      ]
    },
    {
      slug: "vengo",
      film: "Vengo",
      director: "Tony Gatlif",
      code: "ES",
      country: "Spain",
      year: 2000,
      date: "2026-04-01",
      dateNote: "April 2026",
      venue: "The Bath House",
      city: "Hackney Wick, London",
      attendance: null,
      standfirst:
        "Flamenco on screen, then flamenco in the room. A workshop that turned an " +
        "audience into participants, and a coincidence nobody could have planned.",
      story: [
        "Gatlif's film is an exploration of flamenco, rhythm and tradition, so we invited flamenco " +
        "instructor Maika Jimenez Blanco to lead a workshop straight after the credits. Following the " +
        "emotional intensity of the film, the audience got to experience flamenco themselves, through " +
        "movement, rhythm and collective expression.",
        "The collaboration became unexpectedly personal when Maika discovered during the screening that " +
        "Antonio Canales, the lead actor of <em>Vengo</em>, had been her own flamenco instructor. That " +
        "coincidence created a powerful connection between the film, Maika's own history and the " +
        "audience's experience.",
        "We chose The Bath House in Hackney Wick, a community-focused creative space with strong links " +
        "to local artists and residents. The workshop brought three groups into one room: Passenger " +
        "Cinema regulars, Maika's flamenco students, and local dancers from Hackney Wick. People with " +
        "no dance experience at all found each other through music and movement.",
        "Several attendees were inspired enough to join Maika's classes afterwards. Many told us it was " +
        "their favourite Passenger Cinema event."
      ],
      beyond: "Live flamenco workshop with Maika Jimenez Blanco",
      credits: [
        "The Bath House, Hackney Wick, venue",
        "Maika Jimenez Blanco, flamenco instructor"
      ],
      links: [
        {
          label: "Maika's reflection on the evening",
          url: "https://www.linkedin.com/feed/update/urn:li:activity:7452031060575461377/"
        }
      ],
      photos: [],
      confirm: "Exact date needs confirming. We only have 'April 2026'. Photos still to add."
    },
    {
      slug: "the-red-shoes",
      film: "The Red Shoes",
      director: "Powell & Pressburger",
      code: "GB",
      country: "United Kingdom",
      year: 1948,
      date: "2026-03-29",
      venue: "Central Film School, London and Postane, Istanbul",
      city: "London and Istanbul",
      attendance: null,
      standfirst:
        "Two cities, one film, at the same time. London and Istanbul watched together, " +
        "then met on a live-streamed discussion.",
      story: [
        "London and Istanbul are the two cities we call home, so we tried something we had never done " +
        "before: the same film, in both cities, on the same afternoon.",
        "Audiences at Central Film School in London and at Postane in Istanbul watched " +
        "<em>The Red Shoes</em> simultaneously. When the credits rolled, the two rooms were connected " +
        "by a live-streamed discussion, so people who had never met could talk about the film they had " +
        "just shared.",
        "It is the clearest expression of what we mean when we say cinema can build bridges: not a " +
        "metaphor, just two rooms of people in different countries having one conversation."
      ],
      beyond: "Simultaneous London and Istanbul screening, plus a live-streamed discussion",
      credits: [
        "Central Film School, London, venue and partner",
        "Postane, Istanbul, venue"
      ],
      photos: [
        "red-shoes-01.jpg", "red-shoes-02.jpg", "red-shoes-03.jpg",
        "red-shoes-04.jpg", "red-shoes-05.jpg", "red-shoes-06.jpg",
        "red-shoes-ist-01.jpg", "red-shoes-ist-02.jpg", "red-shoes-ist-03.jpg"
      ]
    },
    {
      slug: "in-the-mood-for-love",
      film: "In the Mood for Love",
      director: "Wong Kar-wai",
      code: "HK",
      country: "Hong Kong",
      year: 2000,
      date: "2026-02-07",
      dateNote: "February 2026",
      venue: null,
      city: "London",
      attendance: null,
      standfirst: "Wong Kar-wai's slow-burning Hong Kong, screened in London.",
      story: [
        "A film of corridors, cigarette smoke and things left unsaid, and one of the most requested " +
        "titles by our own audience."
      ],
      beyond: null,
      credits: [],
      photos: [],
      confirm: "Date and venue need confirming. This entry needs your own copy and photos."
    },
    {
      slug: "cinema-paradiso",
      film: "Cinema Paradiso",
      director: "Giuseppe Tornatore",
      code: "IT",
      country: "Italy",
      year: 1988,
      date: "2025-12-10",
      venue: "Genesis Cinema",
      city: "Whitechapel, London",
      attendance: null,
      standfirst:
        "A film about a village cinema and the people it holds together, screened in " +
        "one of London's oldest independent cinemas.",
      story: [
        "There is no more honest film to programme as a community cinema than the one about a community " +
        "cinema. Tornatore's Sicilian village hall, where the whole town turns up, argues, falls in " +
        "love and grieves in front of the same screen, is more or less our mission statement with " +
        "better weather.",
        "We took it to the Genesis in Whitechapel, an independent cinema with well over a century of " +
        "history on the Mile End Road, and filled the room."
      ],
      beyond: null,
      credits: ["Genesis Cinema, Whitechapel, venue"],
      photos: [
        "cinema-paradiso-01.jpg", "cinema-paradiso-02.jpg", "cinema-paradiso-03.jpg",
        "cinema-paradiso-04.jpg", "cinema-paradiso-05.jpg", "cinema-paradiso-06.jpg",
        "cinema-paradiso-07.jpg", "cinema-paradiso-08.jpg"
      ]
    },
    {
      slug: "the-harder-they-come",
      film: "The Harder They Come",
      director: "Perry Henzell",
      code: "JM",
      country: "Jamaica",
      year: 1972,
      date: "2025-11-24",
      venue: "Ciné-Real at The Castle Cinema",
      city: "Hackney, London",
      attendance: null,
      standfirst:
        "Jimmy Cliff on 16mm, projected on film, with half of every ticket going to " +
        "Jamaican hurricane relief.",
      story: [
        "We screened <em>The Harder They Come</em> on 16mm with Ciné-Real, the film club that " +
        "projects nothing else. Reels, splices, the whir of the projector in the room: the way the " +
        "film was meant to be seen.",
        "Jamaica was living through the aftermath of a hurricane at the time. Rather than let that sit " +
        "outside the room, we donated half of all ticket proceeds to hurricane relief, giving the " +
        "audience a way to respond with solidarity as well as curiosity."
      ],
      beyond: "16mm projection, half of ticket proceeds donated to hurricane relief",
      credits: ["Ciné-Real 16mm film club, partner and projection"],
      photos: [
        "harder-they-come-01.jpg", "harder-they-come-02.jpg", "harder-they-come-03.jpg",
        "harder-they-come-04.jpg", "harder-they-come-05.jpg", "harder-they-come-06.jpg",
        "harder-they-come-07.jpg", "harder-they-come-08.jpg"
      ]
    },
    {
      slug: "xibalba-monster",
      film: "Xibalba Monster",
      director: "Manuela Irene",
      code: "MX",
      country: "Mexico",
      year: 2024,
      date: "2025-06-01",
      venue: "Close-Up Cinema",
      city: "Shoreditch, London",
      attendance: 35,
      standfirst:
        "The England premiere of Manuela Irene's film, with the director joining the " +
        "room for a Q&A afterwards.",
      story: [
        "An adventure into Mayan mythology, where the boundary between the living and the underworld " +
        "blurs, and a film almost nobody in England had been able to see.",
        "We hosted its England premiere at Close-Up in Shoreditch, a cinema attached to one of the best " +
        "film libraries in the city. Director Manuela Irene joined us afterwards for a Q&A with the " +
        "audience."
      ],
      beyond: "Q&A with director Manuela Irene",
      credits: ["Close-Up Cinema, Shoreditch, venue", "Manuela Irene, director"],
      photos: [
        "xibalba-monster-01.jpg", "xibalba-monster-02.jpg", "xibalba-monster-03.jpg",
        "xibalba-monster-04.jpg", "xibalba-monster-05.jpg", "xibalba-monster-06.jpg",
        "xibalba-monster-07.jpg", "xibalba-monster-08.jpg"
      ]
    },
    {
      slug: "black-orpheus",
      film: "Black Orpheus",
      director: "Marcel Camus",
      code: "BR",
      country: "Brazil",
      year: 1959,
      date: "2025-03-01",
      dateNote: "Early 2025",
      venue: "The Scala",
      city: "King's Cross, London",
      attendance: 70,
      standfirst:
        "The Orpheus myth relocated to Rio's Carnival, screened in a 1920s picture " +
        "palace, in a room that had never held a screening before.",
      story: [
        "We transformed the former 1920s picture palace into a one-night-only cinema. The room we used " +
        "had never hosted a screening in its life, so we set the scene from scratch and turned it into " +
        "a makeshift theatre.",
        "Seventy people came, our biggest room to date."
      ],
      beyondTitle: "Beyond the screen",
      beyondBody: [
        "We collaborated with the Brazilian organisation VaiBrasil, who ran a Carnival party in the same " +
        "venue immediately after the screening. The film ends in Carnival; so did the evening."
      ],
      beyond: "Carnaval party with VaiBrasil",
      credits: ["The Scala, King's Cross, venue", "VaiBrasil, post-screening Carnaval party"],
      photos: [],
      confirm: "Narrowed to between 19 Feb and 4 Mar 2025. The Janus Films licence " +
        "invoice (no. 36453, $150) is dated 19 Feb 2025 and the photo archive was zipped " +
        "on 4 Mar 2025, so it was almost certainly a weekend in that window: 22/23 Feb or " +
        "1/2 Mar. Photos are still zipped in the Drive folder."
    },
    {
      slug: "tampopo",
      film: "Tampopo",
      director: "Juzo Itami",
      code: "JP",
      country: "Japan",
      year: 1985,
      date: "2024-11-01",
      dateNote: "Late 2024",
      venue: "Picturehouse Members' Bar",
      city: "Finsbury Park, London",
      attendance: 36,
      standfirst:
        "A playful ramen western about the quest for the perfect bowl, followed by " +
        "an actual quest for the perfect bowl.",
      story: [
        "Itami's <em>Tampopo</em> is a comedy about a widow trying to build the perfect noodle shop, and " +
        "it is impossible to watch without getting hungry. So we planned for that.",
        "We screened it in the Members' Bar at Picturehouse Finsbury Park and then walked the audience " +
        "round to Tenmaru for ramen."
      ],
      beyond: "Post-screening ramen at Tenmaru, Finsbury Park",
      credits: ["Picturehouse Finsbury Park, venue", "Tenmaru Ramen, post-screening"],
      photos: [],
      confirm: "Exact date needs confirming. Photos still to add."
    },
    {
      slug: "crossing-the-bridge",
      film: "Crossing the Bridge: The Sound of Istanbul",
      director: "Fatih Akın",
      code: "TR",
      country: "Turkey",
      year: 2005,
      date: "2024-06-16",
      venue: "The Jago",
      city: "Dalston, London",
      attendance: 65,
      first: true,
      standfirst:
        "Where it started. A musical journey through Istanbul's soundscape, followed " +
        "by a live set from Turkish jazz guitarist Kerem Advan.",
      story: [
        "Our launch event. Sixty-five people in a basement in Dalston for a film about the sound of " +
        "Istanbul, which is, more or less, the founding argument for Passenger Cinema: that you can " +
        "travel a long way without leaving your seat.",
        "Akın's documentary crosses the Bosphorus between genres and generations, from arabesk to " +
        "Turkish rock to Kurdish folk. It only made sense to end the evening with live music."
      ],
      beyond: "Live performance by Turkish jazz guitarist Kerem Advan",
      credits: ["The Jago, Dalston, venue", "Kerem Advan, live performance"],
      photos: [
        "crossing-the-bridge-01.jpg", "crossing-the-bridge-02.jpg", "crossing-the-bridge-03.jpg",
        "crossing-the-bridge-04.jpg", "crossing-the-bridge-05.jpg", "crossing-the-bridge-06.jpg",
        "crossing-the-bridge-07.jpg", "crossing-the-bridge-08.jpg"
      ]
    }
  ],

  /* ------------------------------------------------------------------ */
  /*  VOLUNTEER ROLES                                                   */
  /*  Questions here render straight into the volunteer form.           */
  /* ------------------------------------------------------------------ */
  roles: [
    {
      id: "social",
      title: "Social Media & Communications Manager",
      blurb:
        "Shape how Passenger Cinema sounds and looks online: posts, stories, newsletters, " +
        "and the voice that invites people in.",
      questions: [
        {
          id: "about",
          label: "Tell us a bit about yourself",
          hint: "Where you are based (London or elsewhere), your background (studies, work, current occupation), and any experience related to cinema, writing, cultural projects, social media or events.",
          type: "textarea",
          required: true
        },
        {
          id: "inspiration",
          label: "Which Instagram account, film platform or cultural project do you think communicates beautifully online? What do they do well?",
          type: "textarea",
          required: true
        },
        {
          id: "experience",
          label: "Do you have experience with social media, design or content creation?",
          hint: "Feel free to share links to work or accounts you have managed. Professional experience is not required.",
          type: "textarea",
          required: false
        },
        {
          id: "why",
          label: "Why would you like to contribute to Passenger Cinema?",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "programmer",
      title: "Film Programmer",
      blurb:
        "Help decide where we travel next, and what the evening around the film should be.",
      questions: [
        {
          id: "about",
          label: "Tell us a bit about yourself",
          hint: "Where you are based (London or elsewhere), your background (studies, work, current occupation), and any experience related to cinema, writing, cultural projects, social media or events.",
          type: "textarea",
          required: true
        },
        {
          id: "proposal",
          label: "Propose one film you would screen with Passenger Cinema",
          hint: "Briefly describe the cultural context or the experience you would build around it: discussion, food, music, dance, a guest speaker, anything.",
          type: "textarea",
          required: true
        },
        {
          id: "three-films",
          label: "Tell us about 3 films that have had an impact on you, and why",
          type: "textarea",
          required: true
        },
        {
          id: "why",
          label: "Why would you like to contribute to Passenger Cinema?",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "videographer",
      title: "Videographer / Video Storyteller",
      blurb:
        "Capture what actually happens in the room: the set-up, the strangers talking, " +
        "the bit after the credits.",
      questions: [
        {
          id: "about",
          label: "Tell us a bit about yourself",
          hint: "Where you are based (London or elsewhere), your background (studies, work, current occupation), and any experience related to filmmaking, videography, photography, cinema, cultural projects, social media or events.",
          type: "textarea",
          required: true
        },
        {
          id: "inspiration",
          label: "Share 1 to 3 short films, videos, filmmakers or creators whose visual storytelling you really like. What draws you to their work?",
          type: "textarea",
          required: true
        },
        {
          id: "experience",
          label: "Do you have experience filming and/or editing video content?",
          hint: "Links to previous work, a portfolio, social accounts, student projects, anything you have created. Professional experience is not required.",
          type: "textarea",
          required: false
        },
        {
          id: "idea",
          label: "Imagine you were making a 1 to 2 minute video about Passenger Cinema. What would you want to capture or explore?",
          hint: "The story behind Passenger Cinema, the process of putting a screening together, the people involved, the atmosphere of an event, or something completely different.",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      id: "general",
      title: "General volunteer, or something else",
      blurb:
        "Front of house, set-up and pack-down, photography, illustration, translation, " +
        "workshop help, or an idea we have not thought of.",
      questions: [
        {
          id: "about",
          label: "Tell us a bit about yourself",
          hint: "Where you are based, your background, and anything related to cinema, cultural projects or events.",
          type: "textarea",
          required: true
        },
        {
          id: "help",
          label: "How would you like to get involved?",
          hint: "Front of house, set-up, photography, illustration, translation, workshops, or something we have not thought of yet.",
          type: "textarea",
          required: true
        },
        {
          id: "why",
          label: "Why would you like to contribute to Passenger Cinema?",
          type: "textarea",
          required: true
        }
      ]
    }
  ]
};
