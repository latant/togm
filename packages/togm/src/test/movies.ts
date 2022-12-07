import { ogm } from "../togm";
import { CreateNode, createNodes, createRelationships } from "../update";

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

  await createNodes([
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
  ]);

  await createRelationships([
    { start: Keanu, relationshipType: "ACTED_IN", properties: { roles: ["Neo"] }, end: TheMatrix },
    {
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrix,
    },
    {
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrix,
    },
    {
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrix,
    },
    { start: LillyW, relationshipType: "DIRECTED", properties: {}, end: TheMatrix },
    { start: LanaW, relationshipType: "DIRECTED", properties: {}, end: TheMatrix },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: TheMatrix },
    { start: Emil, relationshipType: "ACTED_IN", properties: { roles: ["Emil"] }, end: TheMatrix },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Neo"] },
      end: TheMatrixReloaded,
    },
    {
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrixReloaded,
    },
    {
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrixReloaded,
    },
    {
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrixReloaded,
    },
    { start: LillyW, relationshipType: "DIRECTED", properties: {}, end: TheMatrixReloaded },
    { start: LanaW, relationshipType: "DIRECTED", properties: {}, end: TheMatrixReloaded },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: TheMatrixReloaded },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Neo"] },
      end: TheMatrixRevolutions,
    },
    {
      start: Carrie,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trinity"] },
      end: TheMatrixRevolutions,
    },
    {
      start: Laurence,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Morpheus"] },
      end: TheMatrixRevolutions,
    },
    {
      start: Hugo,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Agent Smith"] },
      end: TheMatrixRevolutions,
    },
    { start: LillyW, relationshipType: "DIRECTED", properties: {}, end: TheMatrixRevolutions },
    { start: LanaW, relationshipType: "DIRECTED", properties: {}, end: TheMatrixRevolutions },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: TheMatrixRevolutions },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kevin Lomax"] },
      end: TheDevilsAdvocate,
    },
    {
      start: Charlize,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mary Ann Lomax"] },
      end: TheDevilsAdvocate,
    },
    {
      start: Al,
      relationshipType: "ACTED_IN",
      properties: { roles: ["John Milton"] },
      end: TheDevilsAdvocate,
    },
    { start: Taylor, relationshipType: "DIRECTED", properties: {}, end: TheDevilsAdvocate },
    {
      start: TomC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Daniel Kaffee"] },
      end: AFewGoodMen,
    },
    {
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Col. Nathan R. Jessup"] },
      end: AFewGoodMen,
    },
    {
      start: DemiM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Cdr. JoAnne Galloway"] },
      end: AFewGoodMen,
    },
    {
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Capt. Jack Ross"] },
      end: AFewGoodMen,
    },
    {
      start: KieferS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Jonathan Kendrick"] },
      end: AFewGoodMen,
    },
    {
      start: NoahW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cpl. Jeffrey Barnes"] },
      end: AFewGoodMen,
    },
    {
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cpl. Carl Hammaker"] },
      end: AFewGoodMen,
    },
    {
      start: KevinP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Sam Weinberg"] },
      end: AFewGoodMen,
    },
    {
      start: JTW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Lt. Col. Matthew Andrew Markinson"] },
      end: AFewGoodMen,
    },
    {
      start: JamesM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Pfc. Louden Downey"] },
      end: AFewGoodMen,
    },
    {
      start: ChristopherG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Stone"] },
      end: AFewGoodMen,
    },
    {
      start: AaronS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Man in Bar"] },
      end: AFewGoodMen,
    },
    { start: RobR, relationshipType: "DIRECTED", properties: {}, end: AFewGoodMen },
    { start: AaronS, relationshipType: "WROTE", properties: {}, end: AFewGoodMen },
    { start: TomC, relationshipType: "ACTED_IN", properties: { roles: ["Maverick"] }, end: TopGun },
    {
      start: KellyM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Charlie"] },
      end: TopGun,
    },
    { start: ValK, relationshipType: "ACTED_IN", properties: { roles: ["Iceman"] }, end: TopGun },
    {
      start: AnthonyE,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Goose"] },
      end: TopGun,
    },
    { start: TomS, relationshipType: "ACTED_IN", properties: { roles: ["Viper"] }, end: TopGun },
    { start: MegR, relationshipType: "ACTED_IN", properties: { roles: ["Carole"] }, end: TopGun },
    { start: TonyS, relationshipType: "DIRECTED", properties: {}, end: TopGun },
    { start: JimC, relationshipType: "WROTE", properties: {}, end: TopGun },
    {
      start: TomC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jerry Maguire"] },
      end: JerryMaguire,
    },
    {
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rod Tidwell"] },
      end: JerryMaguire,
    },
    {
      start: ReneeZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dorothy Boyd"] },
      end: JerryMaguire,
    },
    {
      start: KellyP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Avery Bishop"] },
      end: JerryMaguire,
    },
    {
      start: JerryO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Cushman"] },
      end: JerryMaguire,
    },
    {
      start: JayM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Sugar"] },
      end: JerryMaguire,
    },
    {
      start: BonnieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Laurel Boyd"] },
      end: JerryMaguire,
    },
    {
      start: ReginaK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Marcee Tidwell"] },
      end: JerryMaguire,
    },
    {
      start: JonathanL,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ray Boyd"] },
      end: JerryMaguire,
    },
    { start: CameronC, relationshipType: "DIRECTED", properties: {}, end: JerryMaguire },
    { start: CameronC, relationshipType: "PRODUCED", properties: {}, end: JerryMaguire },
    { start: CameronC, relationshipType: "WROTE", properties: {}, end: JerryMaguire },
    {
      start: WilW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gordie Lachance"] },
      end: StandByMe,
    },
    {
      start: RiverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chris Chambers"] },
      end: StandByMe,
    },
    {
      start: JerryO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Vern Tessio"] },
      end: StandByMe,
    },
    {
      start: CoreyF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Teddy Duchamp"] },
      end: StandByMe,
    },
    {
      start: JohnC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Denny Lachance"] },
      end: StandByMe,
    },
    {
      start: KieferS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ace Merrill"] },
      end: StandByMe,
    },
    {
      start: MarshallB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mr. Lachance"] },
      end: StandByMe,
    },
    { start: RobR, relationshipType: "DIRECTED", properties: {}, end: StandByMe },
    {
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Melvin Udall"] },
      end: AsGoodAsItGets,
    },
    {
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Carol Connelly"] },
      end: AsGoodAsItGets,
    },
    {
      start: GregK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Simon Bishop"] },
      end: AsGoodAsItGets,
    },
    {
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Sachs"] },
      end: AsGoodAsItGets,
    },
    { start: JamesB, relationshipType: "DIRECTED", properties: {}, end: AsGoodAsItGets },
    {
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chris Nielsen"] },
      end: WhatDreamsMayCome,
    },
    {
      start: CubaG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Albert Lewis"] },
      end: WhatDreamsMayCome,
    },
    {
      start: AnnabellaS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annie Collins-Nielsen"] },
      end: WhatDreamsMayCome,
    },
    {
      start: MaxS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["The Tracker"] },
      end: WhatDreamsMayCome,
    },
    {
      start: WernerH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["The Face"] },
      end: WhatDreamsMayCome,
    },
    { start: VincentW, relationshipType: "DIRECTED", properties: {}, end: WhatDreamsMayCome },
    {
      start: EthanH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ishmael Chambers"] },
      end: SnowFallingonCedars,
    },
    {
      start: RickY,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kazuo Miyamoto"] },
      end: SnowFallingonCedars,
    },
    {
      start: MaxS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Nels Gudmundsson"] },
      end: SnowFallingonCedars,
    },
    {
      start: JamesC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Judge Fielding"] },
      end: SnowFallingonCedars,
    },
    { start: ScottH, relationshipType: "DIRECTED", properties: {}, end: SnowFallingonCedars },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joe Fox"] },
      end: YouveGotMail,
    },
    {
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kathleen Kelly"] },
      end: YouveGotMail,
    },
    {
      start: GregK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Navasky"] },
      end: YouveGotMail,
    },
    {
      start: ParkerP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Patricia Eden"] },
      end: YouveGotMail,
    },
    {
      start: DaveC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kevin Jackson"] },
      end: YouveGotMail,
    },
    {
      start: SteveZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["George Pappas"] },
      end: YouveGotMail,
    },
    { start: NoraE, relationshipType: "DIRECTED", properties: {}, end: YouveGotMail },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sam Baldwin"] },
      end: SleeplessInSeattle,
    },
    {
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annie Reed"] },
      end: SleeplessInSeattle,
    },
    {
      start: RitaW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Suzy"] },
      end: SleeplessInSeattle,
    },
    {
      start: BillPull,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Walter"] },
      end: SleeplessInSeattle,
    },
    {
      start: VictorG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Greg"] },
      end: SleeplessInSeattle,
    },
    {
      start: RosieO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Becky"] },
      end: SleeplessInSeattle,
    },
    { start: NoraE, relationshipType: "DIRECTED", properties: {}, end: SleeplessInSeattle },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joe Banks"] },
      end: JoeVersustheVolcano,
    },
    {
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["DeDe", "Angelica Graynamore", "Patricia Graynamore"] },
      end: JoeVersustheVolcano,
    },
    {
      start: Nathan,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Baw"] },
      end: JoeVersustheVolcano,
    },
    { start: JohnS, relationshipType: "DIRECTED", properties: {}, end: JoeVersustheVolcano },
    {
      start: BillyC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Harry Burns"] },
      end: WhenHarryMetSally,
    },
    {
      start: MegR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sally Albright"] },
      end: WhenHarryMetSally,
    },
    {
      start: CarrieF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Marie"] },
      end: WhenHarryMetSally,
    },
    {
      start: BrunoK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jess"] },
      end: WhenHarryMetSally,
    },
    { start: RobR, relationshipType: "DIRECTED", properties: {}, end: WhenHarryMetSally },
    { start: RobR, relationshipType: "PRODUCED", properties: {}, end: WhenHarryMetSally },
    { start: NoraE, relationshipType: "PRODUCED", properties: {}, end: WhenHarryMetSally },
    { start: NoraE, relationshipType: "WROTE", properties: {}, end: WhenHarryMetSally },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mr. White"] },
      end: ThatThingYouDo,
    },
    {
      start: LivT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Faye Dolan"] },
      end: ThatThingYouDo,
    },
    {
      start: Charlize,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Tina"] },
      end: ThatThingYouDo,
    },
    { start: TomH, relationshipType: "DIRECTED", properties: {}, end: ThatThingYouDo },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Shane Falco"] },
      end: TheReplacements,
    },
    {
      start: Brooke,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Annabelle Farrell"] },
      end: TheReplacements,
    },
    {
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jimmy McGinty"] },
      end: TheReplacements,
    },
    {
      start: Orlando,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Clifford Franklin"] },
      end: TheReplacements,
    },
    { start: Howard, relationshipType: "DIRECTED", properties: {}, end: TheReplacements },
    {
      start: MarshallB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Admiral"] },
      end: RescueDawn,
    },
    {
      start: ChristianB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dieter Dengler"] },
      end: RescueDawn,
    },
    {
      start: ZachG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Squad Leader"] },
      end: RescueDawn,
    },
    {
      start: SteveZ,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Duane"] },
      end: RescueDawn,
    },
    { start: WernerH, relationshipType: "DIRECTED", properties: {}, end: RescueDawn },
    {
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Armand Goldman"] },
      end: TheBirdcage,
    },
    {
      start: Nathan,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Albert Goldman"] },
      end: TheBirdcage,
    },
    {
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sen. Kevin Keeley"] },
      end: TheBirdcage,
    },
    { start: MikeN, relationshipType: "DIRECTED", properties: {}, end: TheBirdcage },
    {
      start: RichardH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["English Bob"] },
      end: Unforgiven,
    },
    {
      start: ClintE,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bill Munny"] },
      end: Unforgiven,
    },
    {
      start: Gene,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Little Bill Daggett"] },
      end: Unforgiven,
    },
    { start: ClintE, relationshipType: "DIRECTED", properties: {}, end: Unforgiven },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Johnny Mnemonic"] },
      end: JohnnyMnemonic,
    },
    {
      start: Takeshi,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Takahashi"] },
      end: JohnnyMnemonic,
    },
    {
      start: Dina,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jane"] },
      end: JohnnyMnemonic,
    },
    {
      start: IceT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["J-Bone"] },
      end: JohnnyMnemonic,
    },
    { start: RobertL, relationshipType: "DIRECTED", properties: {}, end: JohnnyMnemonic },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Zachry", "Dr. Henry Goose", "Isaac Sachs", "Dermot Hoggins"] },
      end: CloudAtlas,
    },
    {
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
      start: HalleB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Luisa Rey", "Jocasta Ayrs", "Ovid", "Meronym"] },
      end: CloudAtlas,
    },
    {
      start: JimB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Vyvyan Ayrs", "Captain Molyneux", "Timothy Cavendish"] },
      end: CloudAtlas,
    },
    { start: TomT, relationshipType: "DIRECTED", properties: {}, end: CloudAtlas },
    { start: LillyW, relationshipType: "DIRECTED", properties: {}, end: CloudAtlas },
    { start: LanaW, relationshipType: "DIRECTED", properties: {}, end: CloudAtlas },
    { start: DavidMitchell, relationshipType: "WROTE", properties: {}, end: CloudAtlas },
    { start: StefanArndt, relationshipType: "PRODUCED", properties: {}, end: CloudAtlas },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Robert Langdon"] },
      end: TheDaVinciCode,
    },
    {
      start: IanM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sir Leight Teabing"] },
      end: TheDaVinciCode,
    },
    {
      start: AudreyT,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Sophie Neveu"] },
      end: TheDaVinciCode,
    },
    {
      start: PaulB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Silas"] },
      end: TheDaVinciCode,
    },
    { start: RonH, relationshipType: "DIRECTED", properties: {}, end: TheDaVinciCode },
    { start: Hugo, relationshipType: "ACTED_IN", properties: { roles: ["V"] }, end: VforVendetta },
    {
      start: NatalieP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Evey Hammond"] },
      end: VforVendetta,
    },
    {
      start: StephenR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Eric Finch"] },
      end: VforVendetta,
    },
    {
      start: JohnH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["High Chancellor Adam Sutler"] },
      end: VforVendetta,
    },
    {
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dascomb"] },
      end: VforVendetta,
    },
    { start: JamesM, relationshipType: "DIRECTED", properties: {}, end: VforVendetta },
    { start: LillyW, relationshipType: "PRODUCED", properties: {}, end: VforVendetta },
    { start: LanaW, relationshipType: "PRODUCED", properties: {}, end: VforVendetta },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: VforVendetta },
    { start: LillyW, relationshipType: "WROTE", properties: {}, end: VforVendetta },
    { start: LanaW, relationshipType: "WROTE", properties: {}, end: VforVendetta },
    {
      start: EmileH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Speed Racer"] },
      end: SpeedRacer,
    },
    {
      start: JohnG,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Pops"] },
      end: SpeedRacer,
    },
    {
      start: SusanS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mom"] },
      end: SpeedRacer,
    },
    {
      start: MatthewF,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Racer X"] },
      end: SpeedRacer,
    },
    {
      start: ChristinaR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Trixie"] },
      end: SpeedRacer,
    },
    {
      start: Rain,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Taejo Togokahn"] },
      end: SpeedRacer,
    },
    {
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Cass Jones"] },
      end: SpeedRacer,
    },
    { start: LillyW, relationshipType: "DIRECTED", properties: {}, end: SpeedRacer },
    { start: LanaW, relationshipType: "DIRECTED", properties: {}, end: SpeedRacer },
    { start: LillyW, relationshipType: "WROTE", properties: {}, end: SpeedRacer },
    { start: LanaW, relationshipType: "WROTE", properties: {}, end: SpeedRacer },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: SpeedRacer },
    {
      start: Rain,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Raizo"] },
      end: NinjaAssassin,
    },
    {
      start: NaomieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Mika Coretti"] },
      end: NinjaAssassin,
    },
    {
      start: RickY,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Takeshi"] },
      end: NinjaAssassin,
    },
    {
      start: BenM,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ryan Maslow"] },
      end: NinjaAssassin,
    },
    { start: JamesM, relationshipType: "DIRECTED", properties: {}, end: NinjaAssassin },
    { start: LillyW, relationshipType: "PRODUCED", properties: {}, end: NinjaAssassin },
    { start: LanaW, relationshipType: "PRODUCED", properties: {}, end: NinjaAssassin },
    { start: JoelS, relationshipType: "PRODUCED", properties: {}, end: NinjaAssassin },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Paul Edgecomb"] },
      end: TheGreenMile,
    },
    {
      start: MichaelD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["John Coffey"] },
      end: TheGreenMile,
    },
    {
      start: DavidM,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Brutus "Brutal" Howell'] },
      end: TheGreenMile,
    },
    {
      start: BonnieH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jan Edgecomb"] },
      end: TheGreenMile,
    },
    {
      start: JamesC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Warden Hal Moores"] },
      end: TheGreenMile,
    },
    {
      start: SamR,
      relationshipType: "ACTED_IN",
      properties: { roles: ['"Wild Bill" Wharton'] },
      end: TheGreenMile,
    },
    {
      start: GaryS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Burt Hammersmith"] },
      end: TheGreenMile,
    },
    {
      start: PatriciaC,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Melinda Moores"] },
      end: TheGreenMile,
    },
    { start: FrankD, relationshipType: "DIRECTED", properties: {}, end: TheGreenMile },
    {
      start: FrankL,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Richard Nixon"] },
      end: FrostNixon,
    },
    {
      start: MichaelS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["David Frost"] },
      end: FrostNixon,
    },
    {
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jack Brennan"] },
      end: FrostNixon,
    },
    {
      start: OliverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Zelnick"] },
      end: FrostNixon,
    },
    {
      start: SamR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["James Reston, Jr."] },
      end: FrostNixon,
    },
    { start: RonH, relationshipType: "DIRECTED", properties: {}, end: FrostNixon },
    { start: JackN, relationshipType: "ACTED_IN", properties: { roles: ["Hoffa"] }, end: Hoffa },
    {
      start: DannyD,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Robert "Bobby" Ciaro'] },
      end: Hoffa,
    },
    {
      start: JTW,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Frank Fitzsimmons"] },
      end: Hoffa,
    },
    {
      start: JohnR,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Peter "Pete" Connelly'] },
      end: Hoffa,
    },
    { start: DannyD, relationshipType: "DIRECTED", properties: {}, end: Hoffa },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jim Lovell"] },
      end: Apollo13,
    },
    {
      start: KevinB,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jack Swigert"] },
      end: Apollo13,
    },
    {
      start: EdH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gene Kranz"] },
      end: Apollo13,
    },
    {
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Fred Haise"] },
      end: Apollo13,
    },
    {
      start: GaryS,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Ken Mattingly"] },
      end: Apollo13,
    },
    { start: RonH, relationshipType: "DIRECTED", properties: {}, end: Apollo13 },
    {
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bill Harding"] },
      end: Twister,
    },
    {
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dr. Jo Harding"] },
      end: Twister,
    },
    { start: ZachG, relationshipType: "ACTED_IN", properties: { roles: ["Eddie"] }, end: Twister },
    {
      start: PhilipH,
      relationshipType: "ACTED_IN",
      properties: { roles: ['Dustin "Dusty" Davis'] },
      end: Twister,
    },
    { start: JanB, relationshipType: "DIRECTED", properties: {}, end: Twister },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Chuck Noland"] },
      end: CastAway,
    },
    {
      start: HelenH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kelly Frears"] },
      end: CastAway,
    },
    { start: RobertZ, relationshipType: "DIRECTED", properties: {}, end: CastAway },
    {
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Randle McMurphy"] },
      end: OneFlewOvertheCuckoosNest,
    },
    {
      start: DannyD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Martini"] },
      end: OneFlewOvertheCuckoosNest,
    },
    { start: MilosF, relationshipType: "DIRECTED", properties: {}, end: OneFlewOvertheCuckoosNest },
    {
      start: JackN,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Harry Sanborn"] },
      end: SomethingsGottaGive,
    },
    {
      start: DianeK,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Erica Barry"] },
      end: SomethingsGottaGive,
    },
    {
      start: Keanu,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Julian Mercer"] },
      end: SomethingsGottaGive,
    },
    { start: NancyM, relationshipType: "DIRECTED", properties: {}, end: SomethingsGottaGive },
    { start: NancyM, relationshipType: "PRODUCED", properties: {}, end: SomethingsGottaGive },
    { start: NancyM, relationshipType: "WROTE", properties: {}, end: SomethingsGottaGive },
    {
      start: Robin,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Andrew Marin"] },
      end: BicentennialMan,
    },
    {
      start: OliverP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rupert Burns"] },
      end: BicentennialMan,
    },
    { start: ChrisC, relationshipType: "DIRECTED", properties: {}, end: BicentennialMan },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Rep. Charlie Wilson"] },
      end: CharlieWilsonsWar,
    },
    {
      start: JuliaR,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Joanne Herring"] },
      end: CharlieWilsonsWar,
    },
    {
      start: PhilipH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Gust Avrakotos"] },
      end: CharlieWilsonsWar,
    },
    { start: MikeN, relationshipType: "DIRECTED", properties: {}, end: CharlieWilsonsWar },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Hero Boy", "Father", "Conductor", "Hobo", "Scrooge", "Santa Claus"] },
      end: ThePolarExpress,
    },
    { start: RobertZ, relationshipType: "DIRECTED", properties: {}, end: ThePolarExpress },
    {
      start: TomH,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Jimmy Dugan"] },
      end: ALeagueofTheirOwn,
    },
    {
      start: GeenaD,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Dottie Hinson"] },
      end: ALeagueofTheirOwn,
    },
    {
      start: LoriP,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Kit Keller"] },
      end: ALeagueofTheirOwn,
    },
    {
      start: RosieO,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Doris Murphy"] },
      end: ALeagueofTheirOwn,
    },
    {
      start: Madonna,
      relationshipType: "ACTED_IN",
      properties: { roles: ['"All the Way" Mae Mordabito'] },
      end: ALeagueofTheirOwn,
    },
    {
      start: BillPax,
      relationshipType: "ACTED_IN",
      properties: { roles: ["Bob Hinson"] },
      end: ALeagueofTheirOwn,
    },
    { start: PennyM, relationshipType: "DIRECTED", properties: {}, end: ALeagueofTheirOwn },
    { start: JamesThompson, relationshipType: "FOLLOWS", properties: {}, end: JessicaThompson },
    { start: AngelaScope, relationshipType: "FOLLOWS", properties: {}, end: JessicaThompson },
    { start: PaulBlythe, relationshipType: "FOLLOWS", properties: {}, end: AngelaScope },
    {
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "An amazing journey", rating: 95 },
      end: CloudAtlas,
    },
    {
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Silly, but fun", rating: 65 },
      end: TheReplacements,
    },
    {
      start: JamesThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "The coolest football movie ever", rating: 100 },
      end: TheReplacements,
    },
    {
      start: AngelaScope,
      relationshipType: "REVIEWED",
      properties: { summary: "Pretty funny at times", rating: 62 },
      end: TheReplacements,
    },
    {
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Dark, but compelling", rating: 85 },
      end: Unforgiven,
    },
    {
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
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "A solid romp", rating: 68 },
      end: TheDaVinciCode,
    },
    {
      start: JamesThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "Fun, but a little far fetched", rating: 65 },
      end: TheDaVinciCode,
    },
    {
      start: JessicaThompson,
      relationshipType: "REVIEWED",
      properties: { summary: "You had me at Jerry", rating: 92 },
      end: JerryMaguire,
    },
  ]);
};
