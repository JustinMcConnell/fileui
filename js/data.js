/*
 * Our test data.  In the real world we would generate this on the server.
 *
 * The general structure is that each directory is a hash of hashes.  If we
 * have n files that are stored in directories that might be d levels deep,
 * then we get O(d) runtime when traversing and searching for a given file or
 * directory.  The data could have been stored as an array of hashes but, then
 * we would get O(n) runtime when searching.  That would be slower than the O(d)
 * runtime of the hash of hash structure because O(d) will probably be a lot
 * closer to constant runtime.
 *
 * Each file and directory has name and modified properties.
 *
 * Each directory has a "directory" property that is set to true.  It also
 * has a files hash that represents it's files and subdirectories.
 *
 * Each file has a content property, which represents the content of that file.
 */
var files = {
  "benders": {
    "name": "benders",
    "directory": true,
    "files": {
      "earth": {
        "name": "earth",
        "modified": "1 day ago",
        "directory": true,
        "files": {
          "toph": {
            "name" : "toph",
            "modified": "6 months ago",
            "content": "Toph is an earth bender from the Beifong family."
          }
        }
      },
      "fire": {
        "name": "fire",
        "modified": "2 days ago",
        "directory": true,
        "files": {
          "zuko": {
            "name": "zuko",
            "modified": "1 month ago",
            "content": "Zuko is the Crown Prince of the Fire Nation."
          }
        }
      },
      "water": {
        "name": "water",
        "modified": "4 days ago",
        "directory": true,
        "files": {
          "katara": {
            "name" : "katara",
            "modified": "6 months ago",
            "content": "Katara is a water bender from the Southern Water Tribe."
          }
        }
      },
      "aang": {
        "name": "aang",
        "modified": "10 minutes ago",
        "content": "Aang is the Avatar and a total badass. ThisIsAReallyLongSentanceToShowThatTheFileDisplayComponentHandlesReallyWideContent,ThisIsAReallyLongSentanceToShowThatTheFileDisplayComponentHandlesReallyWideContent,ThisIsAReallyLongSentanceToShowThatTheFileDisplayComponentHandlesReallyWideContent,ThisIsAReallyLongSentanceToShowThatTheFileDisplayComponentHandlesReallyWideContent,ThisIsAReallyLongSentanceToShowThatTheFileDisplayComponentHandlesReallyWideContent,"
      }
    }
  }
};