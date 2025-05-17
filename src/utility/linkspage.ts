import fs from "fs";
import {Collection, FindCursor, MongoClient} from "mongodb";
import {User} from "@/classes/User";
import {generateToken} from "@/token";

// Configuration for database connection
const DB_CONFIG = {
  user     : "flirtable",
  password : "fla11ppGHM!99",
  database : "flirtable",
  network  : "flirtable-mongo",
};

const countryCounts : {[key : string] : number} = {};
const myLanguages = [31];
const myCoCode = "uk";

function hasIntersection(arr1 : any[], arr2 : any[]) : boolean {
  return arr1.some((item) => arr2.includes(item));
}

/**
 * Sort the users into:
 *  1. My language(s)
 *  2. My country
 *  3.    By _Id  (oldest first)
 *  4. By country (most users first)
 *  5.    By _Id  (oldest first)
 *
 *  FIXME Same languages need to be sorted together e.g. Germany and Austria, France and Switzerland
 *  FIXME OR we need to offer a sort sequence e.g. By country, by language, by connection age, by gender?
 */
function sortFunc(a : User, b : User) : number {
  const aHasLang = hasIntersection(a.publicUser.languages, myLanguages);
  const bHasLang = hasIntersection(b.publicUser.languages, myLanguages);
  if (aHasLang && !bHasLang) {
    return -1;
  }
  if (!aHasLang && bHasLang) {
    return 1;
  }

  /**
   * If the user is from my country, they should be first
   * We'll sort the four UK countries as though they are the same country (uk)
   */
  if (a.publicUser.coCode.substring(0, 2) === myCoCode.substring(0, 2)) {
    return -1;
  }
  if (b.publicUser.coCode.substring(0, 2) === myCoCode.substring(0, 2)) {
    return 1;
  }
  if (countryCounts[a.publicUser.coCode] > countryCounts[b.publicUser.coCode]) {
    return -1;
  }
  if (countryCounts[a.publicUser.coCode] < countryCounts[b.publicUser.coCode]) {
    return 1;
  }
  if (a.publicUser.coCode.substring(0, 2) < b.publicUser.coCode.substring(0, 2)) {
    return -1;
  }
  if (a.publicUser.coCode.substring(0, 2) > b.publicUser.coCode.substring(0, 2)) {
    return 1;
  }
  if (a._id < b._id) {
    return -1;
  }
  if (a._id > b._id) {
    return 1;
  }
  return 0;
}


/**
 * Filter and sort the users array (for the user list display) when either userMap or myUser changes
 * This is an array of User objects
 */
function sortUsers(users : User[]) {
  console.log("Computing users");
  /**
   * Filter out my own user and any other users who are not CONNECTED
   * @type {User[]}
   */
  // const filtered : User[] = Array.from(userMap.value.values())
  //   .filter((user) => user._id !== myUser.value._id && user.status === UserStatus.CONNECTED);

  /**
   * Count up how many users in each country
   */
  users.forEach((user : User) => {
    countryCounts[user.publicUser.coCode] = (countryCounts[user.publicUser.coCode] || 0) + 1;
  });

  /**
   * Sort into a sequence that makes sense for myUser
   */
  return users.sort(sortFunc);
};

// Available ports for local development
const ALLOWED_PORTS = [443, 5173, 5174, 5175, 5176];

/**
 * Generate an HTML page with login links for all users
 * @returns Generated HTML string
 */
export const linksPage = async () => {
  try {
    // Construct MongoDB connection URI
    const uri = `mongodb://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.network}:27017/${DB_CONFIG.database}?authSource=admin`;

    const client = new MongoClient(uri);

    try {
      await client.connect();
      console.log("Connected to MongoDB");

      const database = client.db(DB_CONFIG.database);
      const collection : Collection<User> = database.collection<User>("user");

      // Find and sort users
      const cursor : FindCursor<User> = collection.find().sort({_id : 1});
      const userData = await cursor.toArray();

      const sortedUsers = sortUsers(userData);
      console.log(`User count: ${userData.length} sorted: ${sortedUsers.length}`);

      // HTML template with dynamic port selection
      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Flirtable Test Login Links</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .link-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        .login-link {
            display: block;
            padding: 10px;
            background-color: #f0f0f0;
            text-decoration: none;
            color: #333;
            border-radius: 5px;
            text-align: center;
        }
        .login-link:hover {
            background-color: #e0e0e0;
        }
        #port-selector {
            margin-bottom: 20px;
            padding: 10px;
        }
    </style>
</head>
<body>
    <h1>Flirtable Test Login Links</h1>
    
    <select id="port-selector">
        ${ALLOWED_PORTS.map(port =>
        `<option value="${port}">${port === 443 ? "HTTPS (443)" : `HTTP (${port})`}</option>`,
      ).join("\n")}
    </select>

    <div id="links-container" class="link-container">
        ${sortedUsers.map(user => {
        const token = generateToken({...user.publicUser, _id : user._id});
        return `<a href="#" 
                       class="login-link" 
                       data-token="${token}"
                       data-nickname="${user.publicUser.nickname}"
                       onclick="openLoginLink(event)">${user.publicUser.nickname}</a>`;
      }).join("\n")}
    </div>

    <script>
    function openLoginLink(event) {
        event.preventDefault();
        const link = event.target;
        const token = link.getAttribute("data-token");
        const port = document.getElementById("port-selector").value;
        
        const protocol = port === "443" ? "https" : "http";
        const baseUrl = port === "443" 
            ? \`\${protocol}://localhost/chat/\`
            : \`\${protocol}://localhost:\${port}/chat/\`;
        
        const fullUrl = \`\${baseUrl}?token=\${token}&t=\${Date.now()}\`;
        window.open(fullUrl, "_blank");
    }
    </script>
</body>
</html>`;

      // Write the HTML file
      fs.writeFileSync("/usr/server/src/data/flirtable.html", htmlTemplate, "utf8");
      console.log("Links page generated successfully");

    } finally {
      await client.close();
    }
  } catch (err) {
    console.error("Error generating links page:", err);
    throw err;
  }
};
