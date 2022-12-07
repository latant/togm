import { neo, ogm } from "../togm";
import { CreateNode } from "../update";

export const moviesGraph = () =>
  ogm.graph({
    Movie: ogm.node({
      title: ogm.string(),
      tagline: ogm.stringOrNull(),
      released: ogm.number(),
      actors: ogm.manyIn("ACTED_IN", "Person"),
      reviewers: ogm.manyIn("REVIEWED", "Person"),
      producers: ogm.manyIn("PRODUCED", "Person"),
      writers: ogm.manyIn("WROTE", "Person"),
      directors: ogm.manyIn("DIRECTED", "Person"),
    }),
    Person: ogm.node({
      name: ogm.string(),
      born: ogm.numberOrNull(),
      followers: ogm.manyIn("FOLLOWS", "Person"),
      followees: ogm.manyOut("FOLLOWS", "Person"),
      followersAndFollowees: ogm.manyUndirected("FOLLOWS", "Person"),
      moviesActedIn: ogm.manyOut("ACTED_IN", "Movie"),
      reviewedMovies: ogm.manyOut("REVIEWED", "Movie"),
      producedMovies: ogm.manyOut("PRODUCED", "Movie"),
      writtenMovies: ogm.manyOut("WROTE", "Movie"),
      directedMovies: ogm.manyOut("DIRECTED", "Movie"),
    }),
    ACTED_IN: ogm.relationship({
      roles: ogm.stringArray(),
    }),
    REVIEWED: ogm.relationship({
      rating: ogm.number(),
      summary: ogm.string(),
    }),
    PRODUCED: ogm.relationship({}),
    WROTE: ogm.relationship({}),
    DIRECTED: ogm.relationship({}),
    FOLLOWS: ogm.relationship({}),
  });

// const g = moviesGraph();
// type X = NodeSelectionResult<
//   NodeSelectionDefinition<
//     typeof g["definition"],
//     typeof g["definition"]["nodes"]["Movie"],
//     { actors: {} }
//   >
// >;

export const loadMoviesExample = async () => {
  const TheMatrix: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "The Matrix", released: 1999, tagline: "Welcome to the Real World" },
  };
  const Keanu: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Keanu Reeves", born: 1964 },
  };
  const Carrie: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Carrie-Anne Moss", born: 1967 },
  };
  const Laurence: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Laurence Fishburne", born: 1961 },
  };
  const Hugo: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Hugo Weaving", born: 1960 },
  };
  const LillyW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Lilly Wachowski", born: 1967 },
  };
  const LanaW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Lana Wachowski", born: 1965 },
  };
  const JoelS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Joel Silver", born: 1952 },
  };
  const Emil: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Emil Eifrem", born: 1978 },
  };
  const TheMatrixReloaded: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "The Matrix Reloaded", released: 2003, tagline: "Free your mind" },
  };
  const TheMatrixRevolutions: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "The Matrix Revolutions",
      released: 2003,
      tagline: "Everything that has a beginning has an end",
    },
  };
  const TheDevilsAdvocate: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "The Devil's Advocate",
      released: 1997,
      tagline: "Evil has its winning ways",
    },
  };
  const Charlize: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Charlize Theron", born: 1975 },
  };
  const Al: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Al Pacino", born: 1940 },
  };
  const Taylor: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Taylor Hackford", born: 1944 },
  };
  const AFewGoodMen: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "A Few Good Men",
      released: 1992,
      tagline:
        "In the heart of the nation's capital, in a courthouse of the U.S. government, one man will stop at nothing to keep his honor, and one will stop at nothing to find the truth.",
    },
  };
  const TomC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Tom Cruise", born: 1962 },
  };
  const JackN: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jack Nicholson", born: 1937 },
  };
  const DemiM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Demi Moore", born: 1962 },
  };
  const KevinB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Kevin Bacon", born: 1958 },
  };
  const KieferS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Kiefer Sutherland", born: 1966 },
  };
  const NoahW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Noah Wyle", born: 1971 },
  };
  const CubaG: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Cuba Gooding Jr.", born: 1968 },
  };
  const KevinP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Kevin Pollak", born: 1957 },
  };
  const JTW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "J.T. Walsh", born: 1943 },
  };
  const JamesM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "James Marshall", born: 1967 },
  };
  const ChristopherG: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Christopher Guest", born: 1948 },
  };
  const RobR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Rob Reiner", born: 1947 },
  };
  const AaronS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Aaron Sorkin", born: 1961 },
  };
  const TopGun: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Top Gun",
      released: 1986,
      tagline: "I feel the need, the need for speed.",
    },
  };
  const KellyM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Kelly McGillis", born: 1957 },
  };
  const ValK: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Val Kilmer", born: 1959 },
  };
  const AnthonyE: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Anthony Edwards", born: 1962 },
  };
  const TomS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Tom Skerritt", born: 1933 },
  };
  const MegR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Meg Ryan", born: 1961 },
  };
  const TonyS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Tony Scott", born: 1944 },
  };
  const JimC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jim Cash", born: 1941 },
  };
  const JerryMaguire: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Jerry Maguire",
      released: 2000,
      tagline: "The rest of his life begins now.",
    },
  };
  const ReneeZ: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Renee Zellweger", born: 1969 },
  };
  const KellyP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Kelly Preston", born: 1962 },
  };
  const JerryO: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jerry O'Connell", born: 1974 },
  };
  const JayM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jay Mohr", born: 1970 },
  };
  const BonnieH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Bonnie Hunt", born: 1961 },
  };
  const ReginaK: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Regina King", born: 1971 },
  };
  const JonathanL: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jonathan Lipnicki", born: 1996 },
  };
  const CameronC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Cameron Crowe", born: 1957 },
  };
  const StandByMe: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Stand By Me",
      released: 1986,
      tagline:
        "For some, it's the last real taste of innocence, and the first real taste of life. But for everyone, it's the time that memories are made of.",
    },
  };
  const RiverP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "River Phoenix", born: 1970 },
  };
  const CoreyF: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Corey Feldman", born: 1971 },
  };
  const WilW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Wil Wheaton", born: 1972 },
  };
  const JohnC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "John Cusack", born: 1966 },
  };
  const MarshallB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Marshall Bell", born: 1942 },
  };
  const AsGoodAsItGets: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "As Good as It Gets",
      released: 1997,
      tagline: "A comedy from the heart that goes for the throat.",
    },
  };
  const HelenH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Helen Hunt", born: 1963 },
  };
  const GregK: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Greg Kinnear", born: 1963 },
  };
  const JamesB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "James L. Brooks", born: 1940 },
  };
  const WhatDreamsMayCome: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "What Dreams May Come",
      released: 1998,
      tagline: "After life there is more. The end is just the beginning.",
    },
  };
  const AnnabellaS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Annabella Sciorra", born: 1960 },
  };
  const MaxS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Max von Sydow", born: 1929 },
  };
  const WernerH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Werner Herzog", born: 1942 },
  };
  const Robin: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Robin Williams", born: 1951 },
  };
  const VincentW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Vincent Ward", born: 1956 },
  };
  const SnowFallingonCedars: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Snow Falling on Cedars",
      released: 1999,
      tagline: "First loves last. Forever.",
    },
  };
  const EthanH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ethan Hawke", born: 1970 },
  };
  const RickY: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Rick Yune", born: 1971 },
  };
  const JamesC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "James Cromwell", born: 1940 },
  };
  const ScottH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Scott Hicks", born: 1953 },
  };
  const YouveGotMail: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "You've Got Mail",
      released: 1998,
      tagline: "At odds in life... in love on-line.",
    },
  };
  const ParkerP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Parker Posey", born: 1968 },
  };
  const DaveC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Dave Chappelle", born: 1973 },
  };
  const SteveZ: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Steve Zahn", born: 1967 },
  };
  const TomH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Tom Hanks", born: 1956 },
  };
  const NoraE: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Nora Ephron", born: 1941 },
  };
  const SleeplessInSeattle: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Sleepless in Seattle",
      released: 1993,
      tagline:
        "What if someone you never met, someone you never saw, someone you never knew was the only someone for you?",
    },
  };
  const RitaW: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Rita Wilson", born: 1956 },
  };
  const BillPull: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Bill Pullman", born: 1953 },
  };
  const VictorG: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Victor Garber", born: 1949 },
  };
  const RosieO: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Rosie O'Donnell", born: 1962 },
  };
  const JoeVersustheVolcano: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Joe Versus the Volcano",
      released: 1990,
      tagline: "A story of love, lava and burning desire.",
    },
  };
  const JohnS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "John Patrick Stanley", born: 1950 },
  };
  const Nathan: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Nathan Lane", born: 1956 },
  };
  const WhenHarryMetSally: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "When Harry Met Sally",
      released: 1998,
      tagline: "Can two friends sleep together and still love each other in the morning?",
    },
  };
  const BillyC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Billy Crystal", born: 1948 },
  };
  const CarrieF: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Carrie Fisher", born: 1956 },
  };
  const BrunoK: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Bruno Kirby", born: 1949 },
  };
  const ThatThingYouDo: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "That Thing You Do",
      released: 1996,
      tagline:
        "In every life there comes a time when that thing you dream becomes that thing you do",
    },
  };
  const LivT: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Liv Tyler", born: 1977 },
  };
  const TheReplacements: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "The Replacements",
      released: 2000,
      tagline: "Pain heals, Chicks dig scars... Glory lasts forever",
    },
  };
  const Brooke: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Brooke Langton", born: 1970 },
  };
  const Gene: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Gene Hackman", born: 1930 },
  };
  const Orlando: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Orlando Jones", born: 1968 },
  };
  const Howard: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Howard Deutch", born: 1950 },
  };
  const RescueDawn: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "RescueDawn",
      released: 2006,
      tagline: "Based on the extraordinary true story of one man's fight for freedom",
    },
  };
  const ChristianB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Christian Bale", born: 1974 },
  };
  const ZachG: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Zach Grenier", born: 1954 },
  };
  const TheBirdcage: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "The Birdcage", released: 1996, tagline: "Come as you are" },
  };
  const MikeN: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Mike Nichols", born: 1931 },
  };
  const Unforgiven: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Unforgiven",
      released: 1992,
      tagline: "It's a hell of a thing, killing a man",
    },
  };
  const RichardH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Richard Harris", born: 1930 },
  };
  const ClintE: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Clint Eastwood", born: 1930 },
  };
  const JohnnyMnemonic: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Johnny Mnemonic",
      released: 1995,
      tagline: "The hottest data on earth. In the coolest head in town",
    },
  };
  const Takeshi: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Takeshi Kitano", born: 1947 },
  };
  const Dina: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Dina Meyer", born: 1968 },
  };
  const IceT: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ice-T", born: 1958 },
  };
  const RobertL: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Robert Longo", born: 1953 },
  };
  const CloudAtlas: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "Cloud Atlas", released: 2012, tagline: "Everything is connected" },
  };
  const HalleB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Halle Berry", born: 1966 },
  };
  const JimB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jim Broadbent", born: 1949 },
  };
  const TomT: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Tom Tykwer", born: 1965 },
  };
  const DavidMitchell: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "David Mitchell", born: 1969 },
  };
  const StefanArndt: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Stefan Arndt", born: 1961 },
  };
  const TheDaVinciCode: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "The Da Vinci Code", released: 2006, tagline: "Break The Codes" },
  };
  const IanM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ian McKellen", born: 1939 },
  };
  const AudreyT: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Audrey Tautou", born: 1976 },
  };
  const PaulB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Paul Bettany", born: 1971 },
  };
  const RonH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ron Howard", born: 1954 },
  };
  const VforVendetta: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "V for Vendetta", released: 2006, tagline: "Freedom! Forever!" },
  };
  const NatalieP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Natalie Portman", born: 1981 },
  };
  const StephenR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Stephen Rea", born: 1946 },
  };
  const JohnH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "John Hurt", born: 1940 },
  };
  const BenM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ben Miles", born: 1967 },
  };
  const SpeedRacer: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "Speed Racer", released: 2008, tagline: "Speed has no limits" },
  };
  const EmileH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Emile Hirsch", born: 1985 },
  };
  const JohnG: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "John Goodman", born: 1960 },
  };
  const SusanS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Susan Sarandon", born: 1946 },
  };
  const MatthewF: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Matthew Fox", born: 1966 },
  };
  const ChristinaR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Christina Ricci", born: 1980 },
  };
  const Rain: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Rain", born: 1982 },
  };
  const NinjaAssassin: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Ninja Assassin",
      released: 2009,
      tagline: "Prepare to enter a secret world of assassins",
    },
  };
  const NaomieH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Naomie Harris" },
  };
  const TheGreenMile: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "The Green Mile",
      released: 1999,
      tagline: "Walk a mile you'll never forget.",
    },
  };
  const MichaelD: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Michael Clarke Duncan", born: 1957 },
  };
  const DavidM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "David Morse", born: 1953 },
  };
  const SamR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Sam Rockwell", born: 1968 },
  };
  const GaryS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Gary Sinise", born: 1955 },
  };
  const PatriciaC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Patricia Clarkson", born: 1959 },
  };
  const FrankD: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Frank Darabont", born: 1959 },
  };
  const FrostNixon: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Frost/Nixon",
      released: 2008,
      tagline: "400 million people were waiting for the truth.",
    },
  };
  const FrankL: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Frank Langella", born: 1938 },
  };
  const MichaelS: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Michael Sheen", born: 1969 },
  };
  const OliverP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Oliver Platt", born: 1960 },
  };
  const Hoffa: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Hoffa",
      released: 1992,
      tagline: "He didn't want law. He wanted justice.",
    },
  };
  const DannyD: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Danny DeVito", born: 1944 },
  };
  const JohnR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "John C. Reilly", born: 1965 },
  };
  const Apollo13: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "Apollo 13", released: 1995, tagline: "Houston, we have a problem." },
  };
  const EdH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Ed Harris", born: 1950 },
  };
  const BillPax: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Bill Paxton", born: 1955 },
  };
  const Twister: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "Twister", released: 1996, tagline: "Don't Breathe. Don't Look Back." },
  };
  const PhilipH: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Philip Seymour Hoffman", born: 1967 },
  };
  const JanB: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jan de Bont", born: 1943 },
  };
  const CastAway: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Cast Away",
      released: 2000,
      tagline: "At the edge of the world, his journey begins.",
    },
  };
  const RobertZ: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Robert Zemeckis", born: 1951 },
  };
  const OneFlewOvertheCuckoosNest: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "One Flew Over the Cuckoo's Nest",
      released: 1975,
      tagline: "If he's crazy, what does that make you?",
    },
  };
  const MilosF: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Milos Forman", born: 1932 },
  };
  const SomethingsGottaGive: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: { title: "Something's Gotta Give", released: 2003 },
  };
  const DianeK: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Diane Keaton", born: 1946 },
  };
  const NancyM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Nancy Meyers", born: 1949 },
  };
  const BicentennialMan: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Bicentennial Man",
      released: 1999,
      tagline: "One robot's 200 year journey to become an ordinary man.",
    },
  };
  const ChrisC: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Chris Columbus", born: 1958 },
  };
  const CharlieWilsonsWar: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "Charlie Wilson's War",
      released: 2007,
      tagline:
        "A stiff drink. A little mascara. A lot of nerve. Who said they couldn't bring down the Soviet empire.",
    },
  };
  const JuliaR: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Julia Roberts", born: 1967 },
  };
  const ThePolarExpress: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "The Polar Express",
      released: 2004,
      tagline: "This Holiday Season... Believe",
    },
  };
  const ALeagueofTheirOwn: CreateNode = {
    type: "createNode",
    labels: ["Movie"],
    properties: {
      title: "A League of Their Own",
      released: 1992,
      tagline: "Once in a lifetime you get a chance to do something different.",
    },
  };
  const Madonna: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Madonna", born: 1954 },
  };
  const GeenaD: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Geena Davis", born: 1956 },
  };
  const LoriP: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Lori Petty", born: 1963 },
  };
  const PennyM: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Penny Marshall", born: 1943 },
  };
  const PaulBlythe: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Paul Blythe" },
  };
  const AngelaScope: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Angela Scope" },
  };
  const JessicaThompson: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "Jessica Thompson" },
  };
  const JamesThompson: CreateNode = {
    type: "createNode",
    labels: ["Person"],
    properties: { name: "James Thompson" },
  };

  await neo.runCommands([
    TheMatrix,
    Keanu,
    Carrie,
    Laurence,
    Hugo,
    LillyW,
    LanaW,
    JoelS,
    Emil,
    TheMatrixReloaded,
    TheMatrixRevolutions,
    TheDevilsAdvocate,
    Charlize,
    Al,
    Taylor,
    AFewGoodMen,
    TomC,
    JackN,
    DemiM,
    KevinB,
    KieferS,
    NoahW,
    CubaG,
    KevinP,
    JTW,
    JamesM,
    ChristopherG,
    RobR,
    AaronS,
    TopGun,
    KellyM,
    ValK,
    AnthonyE,
    TomS,
    MegR,
    TonyS,
    JimC,
    JerryMaguire,
    ReneeZ,
    KellyP,
    JerryO,
    JayM,
    BonnieH,
    ReginaK,
    JonathanL,
    CameronC,
    StandByMe,
    RiverP,
    CoreyF,
    WilW,
    JohnC,
    MarshallB,
    AsGoodAsItGets,
    HelenH,
    GregK,
    JamesB,
    WhatDreamsMayCome,
    AnnabellaS,
    MaxS,
    WernerH,
    Robin,
    VincentW,
    SnowFallingonCedars,
    EthanH,
    RickY,
    JamesC,
    ScottH,
    YouveGotMail,
    ParkerP,
    DaveC,
    SteveZ,
    TomH,
    NoraE,
    SleeplessInSeattle,
    RitaW,
    BillPull,
    VictorG,
    RosieO,
    JoeVersustheVolcano,
    JohnS,
    Nathan,
    WhenHarryMetSally,
    BillyC,
    CarrieF,
    BrunoK,
    ThatThingYouDo,
    LivT,
    TheReplacements,
    Brooke,
    Gene,
    Orlando,
    Howard,
    RescueDawn,
    ChristianB,
    ZachG,
    TheBirdcage,
    MikeN,
    Unforgiven,
    RichardH,
    ClintE,
    JohnnyMnemonic,
    Takeshi,
    Dina,
    IceT,
    RobertL,
    CloudAtlas,
    HalleB,
    JimB,
    TomT,
    DavidMitchell,
    StefanArndt,
    TheDaVinciCode,
    IanM,
    AudreyT,
    PaulB,
    RonH,
    VforVendetta,
    NatalieP,
    StephenR,
    JohnH,
    BenM,
    SpeedRacer,
    EmileH,
    JohnG,
    SusanS,
    MatthewF,
    ChristinaR,
    Rain,
    NinjaAssassin,
    NaomieH,
    TheGreenMile,
    MichaelD,
    DavidM,
    SamR,
    GaryS,
    PatriciaC,
    FrankD,
    FrostNixon,
    FrankL,
    MichaelS,
    OliverP,
    Hoffa,
    DannyD,
    JohnR,
    Apollo13,
    EdH,
    BillPax,
    Twister,
    PhilipH,
    JanB,
    CastAway,
    RobertZ,
    OneFlewOvertheCuckoosNest,
    MilosF,
    SomethingsGottaGive,
    DianeK,
    NancyM,
    BicentennialMan,
    ChrisC,
    CharlieWilsonsWar,
    JuliaR,
    ThePolarExpress,
    ALeagueofTheirOwn,
    Madonna,
    GeenaD,
    LoriP,
    PennyM,
    PaulBlythe,
    AngelaScope,
    JessicaThompson,
    JamesThompson,
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Neo"] },
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: Emil,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Emil"] },
      end: TheMatrix,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Neo"] },
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: TheMatrixReloaded,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Neo"] },
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: TheMatrixRevolutions,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kevin Lomax"] },
      end: TheDevilsAdvocate,
    },
    {
      type: "createRelationship",
      start: Charlize,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mary Ann Lomax"] },
      end: TheDevilsAdvocate,
    },
    {
      type: "createRelationship",
      start: Al,
      relationshipType: "ACTED_IN",
      properties: { roles: ["John Milton"] },
      end: TheDevilsAdvocate,
    },
    {
      type: "createRelationship",
      start: Taylor,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheDevilsAdvocate,
    },
    {
      type: "createRelationship",
      start: TomC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Daniel Kaffee"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Col. Nathan R. Jessup"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: DemiM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Cdr. JoAnne Galloway"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Capt. Jack Ross"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: KieferS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Jonathan Kendrick"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: NoahW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cpl. Jeffrey Barnes"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cpl. Carl Hammaker"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: KevinP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Sam Weinberg"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: JTW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Col. Matthew Andrew Markinson"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: JamesM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Pfc. Louden Downey"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: ChristopherG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Stone"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: AaronS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Man in Bar"] },
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: RobR,
      relationshipType: "DIRECTED",
      properties: {},
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: AaronS,
      relationshipType: "WROTE",
      properties: {},
      end: AFewGoodMen,
    },
    {
      type: "createRelationship",
      start: TomC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Maverick"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: KellyM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Charlie"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: ValK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Iceman"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: AnthonyE,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Goose"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: TomS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Viper"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Carole"] },
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: TonyS,
      relationshipType: "DIRECTED",
      properties: {},
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: JimC,
      relationshipType: "WROTE",
      properties: {},
      end: TopGun,
    },
    {
      type: "createRelationship",
      start: TomC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jerry Maguire"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rod Tidwell"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: ReneeZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dorothy Boyd"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: KellyP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Avery Bishop"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: JerryO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Cushman"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: JayM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Sugar"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: BonnieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Laurel Boyd"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: ReginaK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Marcee Tidwell"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: JonathanL,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ray Boyd"] },
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: CameronC,
      relationshipType: "DIRECTED",
      properties: {},
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: CameronC,
      relationshipType: "PRODUCED",
      properties: {},
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: CameronC,
      relationshipType: "WROTE",
      properties: {},
      end: JerryMaguire,
    },
    {
      type: "createRelationship",
      start: WilW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gordie Lachance"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: RiverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chris Chambers"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: JerryO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Vern Tessio"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: CoreyF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Teddy Duchamp"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: JohnC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Denny Lachance"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: KieferS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ace Merrill"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: MarshallB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mr. Lachance"] },
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: RobR,
      relationshipType: "DIRECTED",
      properties: {},
      end: StandByMe,
    },
    {
      type: "createRelationship",
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Melvin Udall"] },
      end: AsGoodAsItGets,
    },
    {
      type: "createRelationship",
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Carol Connelly"] },
      end: AsGoodAsItGets,
    },
    {
      type: "createRelationship",
      start: GregK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Simon Bishop"] },
      end: AsGoodAsItGets,
    },
    {
      type: "createRelationship",
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Sachs"] },
      end: AsGoodAsItGets,
    },
    {
      type: "createRelationship",
      start: JamesB,
      relationshipType: "DIRECTED",
      properties: {},
      end: AsGoodAsItGets,
    },
    {
      type: "createRelationship",
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chris Nielsen"] },
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Albert Lewis"] },
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: AnnabellaS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annie Collins-Nielsen"] },
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: MaxS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["The Tracker"] },
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: WernerH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["The Face"] },
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: VincentW,
      relationshipType: "DIRECTED",
      properties: {},
      end: WhatDreamsMayCome,
    },
    {
      type: "createRelationship",
      start: EthanH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ishmael Chambers"] },
      end: SnowFallingonCedars,
    },
    {
      type: "createRelationship",
      start: RickY,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kazuo Miyamoto"] },
      end: SnowFallingonCedars,
    },
    {
      type: "createRelationship",
      start: MaxS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Nels Gudmundsson"] },
      end: SnowFallingonCedars,
    },
    {
      type: "createRelationship",
      start: JamesC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Judge Fielding"] },
      end: SnowFallingonCedars,
    },
    {
      type: "createRelationship",
      start: ScottH,
      relationshipType: "DIRECTED",
      properties: {},
      end: SnowFallingonCedars,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joe Fox"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kathleen Kelly"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: GregK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Navasky"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: ParkerP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Patricia Eden"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: DaveC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kevin Jackson"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: SteveZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["George Pappas"] },
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: NoraE,
      relationshipType: "DIRECTED",
      properties: {},
      end: YouveGotMail,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sam Baldwin"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annie Reed"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: RitaW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Suzy"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: BillPull,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Walter"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: VictorG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Greg"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: RosieO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Becky"] },
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: NoraE,
      relationshipType: "DIRECTED",
      properties: {},
      end: SleeplessInSeattle,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joe Banks"] },
      end: JoeVersustheVolcano,
    },
    {
      type: "createRelationship",
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["DeDe", "Angelica Graynamore", "Patricia Graynamore"] },
      end: JoeVersustheVolcano,
    },
    {
      type: "createRelationship",
      start: Nathan,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Baw"] },
      end: JoeVersustheVolcano,
    },
    {
      type: "createRelationship",
      start: JohnS,
      relationshipType: "DIRECTED",
      properties: {},
      end: JoeVersustheVolcano,
    },
    {
      type: "createRelationship",
      start: BillyC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Harry Burns"] },
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sally Albright"] },
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: CarrieF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Marie"] },
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: BrunoK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jess"] },
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: RobR,
      relationshipType: "DIRECTED",
      properties: {},
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: RobR,
      relationshipType: "PRODUCED",
      properties: {},
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: NoraE,
      relationshipType: "PRODUCED",
      properties: {},
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: NoraE,
      relationshipType: "WROTE",
      properties: {},
      end: WhenHarryMetSally,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mr. White"] },
      end: ThatThingYouDo,
    },
    {
      type: "createRelationship",
      start: LivT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Faye Dolan"] },
      end: ThatThingYouDo,
    },
    {
      type: "createRelationship",
      start: Charlize,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Tina"] },
      end: ThatThingYouDo,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "DIRECTED",
      properties: {},
      end: ThatThingYouDo,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Shane Falco"] },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: Brooke,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annabelle Farrell"] },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jimmy McGinty"] },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: Orlando,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Clifford Franklin"] },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: Howard,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: MarshallB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Admiral"] },
      end: RescueDawn,
    },
    {
      type: "createRelationship",
      start: ChristianB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dieter Dengler"] },
      end: RescueDawn,
    },
    {
      type: "createRelationship",
      start: ZachG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Squad Leader"] },
      end: RescueDawn,
    },
    {
      type: "createRelationship",
      start: SteveZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Duane"] },
      end: RescueDawn,
    },
    {
      type: "createRelationship",
      start: WernerH,
      relationshipType: "DIRECTED",
      properties: {},
      end: RescueDawn,
    },
    {
      type: "createRelationship",
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Armand Goldman"] },
      end: TheBirdcage,
    },
    {
      type: "createRelationship",
      start: Nathan,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Albert Goldman"] },
      end: TheBirdcage,
    },
    {
      type: "createRelationship",
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sen. Kevin Keeley"] },
      end: TheBirdcage,
    },
    {
      type: "createRelationship",
      start: MikeN,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheBirdcage,
    },
    {
      type: "createRelationship",
      start: RichardH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["English Bob"] },
      end: Unforgiven,
    },
    {
      type: "createRelationship",
      start: ClintE,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bill Munny"] },
      end: Unforgiven,
    },
    {
      type: "createRelationship",
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Little Bill Daggett"] },
      end: Unforgiven,
    },
    {
      type: "createRelationship",
      start: ClintE,
      relationshipType: "DIRECTED",
      properties: {},
      end: Unforgiven,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Johnny Mnemonic"] },
      end: JohnnyMnemonic,
    },
    {
      type: "createRelationship",
      start: Takeshi,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Takahashi"] },
      end: JohnnyMnemonic,
    },
    {
      type: "createRelationship",
      start: Dina,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jane"] },
      end: JohnnyMnemonic,
    },
    {
      type: "createRelationship",
      start: IceT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["J-Bone"] },
      end: JohnnyMnemonic,
    },
    {
      type: "createRelationship",
      start: RobertL,
      relationshipType: "DIRECTED",
      properties: {},
      end: JohnnyMnemonic,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Zachry", "Dr. Henry Goose", "Isaac Sachs", "Dermot Hoggins"] },
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: {
        roles: [
          "Bill Smoke",
          "Haskell Moore",
          "Tadeusz Kesselring",
          "Nurse Noakes",
          "Boardman Mephi",
          "Old Georgie",
        ],
      },
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: HalleB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Luisa Rey", "Jocasta Ayrs", "Ovid", "Meronym"] },
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: JimB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Vyvyan Ayrs", "Captain Molyneux", "Timothy Cavendish"] },
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: TomT,
      relationshipType: "DIRECTED",
      properties: {},
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "DIRECTED",
      properties: {},
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "DIRECTED",
      properties: {},
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: DavidMitchell,
      relationshipType: "WROTE",
      properties: {},
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: StefanArndt,
      relationshipType: "PRODUCED",
      properties: {},
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Robert Langdon"] },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: IanM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sir Leight Teabing"] },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: AudreyT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sophie Neveu"] },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: PaulB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Silas"] },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: RonH,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["V"] },
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: NatalieP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Evey Hammond"] },
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: StephenR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Eric Finch"] },
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: JohnH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["High Chancellor Adam Sutler"] },
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dascomb"] },
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: JamesM,
      relationshipType: "DIRECTED",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "PRODUCED",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "PRODUCED",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "WROTE",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "WROTE",
      properties: {},
      end: VforVendetta,
    },
    {
      type: "createRelationship",
      start: EmileH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Speed Racer"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: JohnG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Pops"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: SusanS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mom"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: MatthewF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Racer X"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: ChristinaR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trixie"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: Rain,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Taejo Togokahn"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cass Jones"] },
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "DIRECTED",
      properties: {},
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "DIRECTED",
      properties: {},
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "WROTE",
      properties: {},
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "WROTE",
      properties: {},
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: SpeedRacer,
    },
    {
      type: "createRelationship",
      start: Rain,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Raizo"] },
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: NaomieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mika Coretti"] },
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: RickY,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Takeshi"] },
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ryan Maslow"] },
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: JamesM,
      relationshipType: "DIRECTED",
      properties: {},
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: LillyW,
      relationshipType: "PRODUCED",
      properties: {},
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: LanaW,
      relationshipType: "PRODUCED",
      properties: {},
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: JoelS,
      relationshipType: "PRODUCED",
      properties: {},
      end: NinjaAssassin,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Paul Edgecomb"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: MichaelD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["John Coffey"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: DavidM,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Brutus "Brutal" Howell'] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: BonnieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jan Edgecomb"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: JamesC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Warden Hal Moores"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: SamR,
      relationshipType: "ACTED_IN",
      properties: { roles: ['"Wild Bill" Wharton'] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: GaryS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Burt Hammersmith"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: PatriciaC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Melinda Moores"] },
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: FrankD,
      relationshipType: "DIRECTED",
      properties: {},
      end: TheGreenMile,
    },
    {
      type: "createRelationship",
      start: FrankL,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Richard Nixon"] },
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: MichaelS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["David Frost"] },
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jack Brennan"] },
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: OliverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Zelnick"] },
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: SamR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["James Reston, Jr."] },
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: RonH,
      relationshipType: "DIRECTED",
      properties: {},
      end: FrostNixon,
    },
    {
      type: "createRelationship",
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Hoffa"] },
      end: Hoffa,
    },
    {
      type: "createRelationship",
      start: DannyD,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Robert "Bobby" Ciaro'] },
      end: Hoffa,
    },
    {
      type: "createRelationship",
      start: JTW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Fitzsimmons"] },
      end: Hoffa,
    },
    {
      type: "createRelationship",
      start: JohnR,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Peter "Pete" Connelly'] },
      end: Hoffa,
    },
    {
      type: "createRelationship",
      start: DannyD,
      relationshipType: "DIRECTED",
      properties: {},
      end: Hoffa,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jim Lovell"] },
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jack Swigert"] },
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: EdH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gene Kranz"] },
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Fred Haise"] },
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: GaryS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ken Mattingly"] },
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: RonH,
      relationshipType: "DIRECTED",
      properties: {},
      end: Apollo13,
    },
    {
      type: "createRelationship",
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bill Harding"] },
      end: Twister,
    },
    {
      type: "createRelationship",
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Jo Harding"] },
      end: Twister,
    },
    {
      type: "createRelationship",
      start: ZachG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Eddie"] },
      end: Twister,
    },
    {
      type: "createRelationship",
      start: PhilipH,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Dustin "Dusty" Davis'] },
      end: Twister,
    },
    {
      type: "createRelationship",
      start: JanB,
      relationshipType: "DIRECTED",
      properties: {},
      end: Twister,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chuck Noland"] },
      end: CastAway,
    },
    {
      type: "createRelationship",
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kelly Frears"] },
      end: CastAway,
    },
    {
      type: "createRelationship",
      start: RobertZ,
      relationshipType: "DIRECTED",
      properties: {},
      end: CastAway,
    },
    {
      type: "createRelationship",
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Randle McMurphy"] },
      end: OneFlewOvertheCuckoosNest,
    },
    {
      type: "createRelationship",
      start: DannyD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Martini"] },
      end: OneFlewOvertheCuckoosNest,
    },
    {
      type: "createRelationship",
      start: MilosF,
      relationshipType: "DIRECTED",
      properties: {},
      end: OneFlewOvertheCuckoosNest,
    },
    {
      type: "createRelationship",
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Harry Sanborn"] },
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: DianeK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Erica Barry"] },
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Julian Mercer"] },
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: NancyM,
      relationshipType: "DIRECTED",
      properties: {},
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: NancyM,
      relationshipType: "PRODUCED",
      properties: {},
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: NancyM,
      relationshipType: "WROTE",
      properties: {},
      end: SomethingsGottaGive,
    },
    {
      type: "createRelationship",
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Andrew Marin"] },
      end: BicentennialMan,
    },
    {
      type: "createRelationship",
      start: OliverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rupert Burns"] },
      end: BicentennialMan,
    },
    {
      type: "createRelationship",
      start: ChrisC,
      relationshipType: "DIRECTED",
      properties: {},
      end: BicentennialMan,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rep. Charlie Wilson"] },
      end: CharlieWilsonsWar,
    },
    {
      type: "createRelationship",
      start: JuliaR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joanne Herring"] },
      end: CharlieWilsonsWar,
    },
    {
      type: "createRelationship",
      start: PhilipH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gust Avrakotos"] },
      end: CharlieWilsonsWar,
    },
    {
      type: "createRelationship",
      start: MikeN,
      relationshipType: "DIRECTED",
      properties: {},
      end: CharlieWilsonsWar,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Hero Boy", "Father", "Conductor", "Hobo", "Scrooge", "Santa Claus"] },
      end: ThePolarExpress,
    },
    {
      type: "createRelationship",
      start: RobertZ,
      relationshipType: "DIRECTED",
      properties: {},
      end: ThePolarExpress,
    },
    {
      type: "createRelationship",
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jimmy Dugan"] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: GeenaD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dottie Hinson"] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: LoriP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kit Keller"] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: RosieO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Doris Murphy"] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: Madonna,
      relationshipType: "ACTED_IN",
      properties: { roles: ['"All the Way" Mae Mordabito'] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Hinson"] },
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: PennyM,
      relationshipType: "DIRECTED",
      properties: {},
      end: ALeagueofTheirOwn,
    },
    {
      type: "createRelationship",
      start: JamesThompson,
      relationshipType: "FOLLOWS",
      properties: {},
      end: JessicaThompson,
    },
    {
      type: "createRelationship",
      start: AngelaScope,
      relationshipType: "FOLLOWS",
      properties: {},
      end: JessicaThompson,
    },
    {
      type: "createRelationship",
      start: PaulBlythe,
      relationshipType: "FOLLOWS",
      properties: {},
      end: AngelaScope,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "An amazing journey", rating: 95 },
      end: CloudAtlas,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Silly, but fun", rating: 65 },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: JamesThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "The coolest football movie ever", rating: 100 },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: AngelaScope,
      relationshipType: "REVIEWED",
      properties: { summary: "Pretty funny at times", rating: 62 },
      end: TheReplacements,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Dark, but compelling", rating: 85 },
      end: Unforgiven,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: {
        summary:
          "Slapstick redeemed only by the Robin Williams and Gene Hackman's stellar performances",
        rating: 45,
      },
      end: TheBirdcage,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "A solid romp", rating: 68 },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: JamesThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Fun, but a little far fetched", rating: 65 },
      end: TheDaVinciCode,
    },
    {
      type: "createRelationship",
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "You had me at Jerry", rating: 92 },
      end: JerryMaguire,
    },
  ]);
};
