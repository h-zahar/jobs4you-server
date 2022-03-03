
module.exports = ({ name,email,phone,date,img,location,education,
    expYear,company,designation,skills,languages,institute}) => {
        console.log(img)
        const today = new Date();
    return `
        <!doctype html>
        <html>
           <head>
              <meta charset="utf-8">
              <title>PDF Result Template</title>
              <style>
                 .resume-box {
                 max-width: 800px;
                 margin: auto;
                 padding: 30px;
                 border: 1px solid #eee;
                 box-shadow: 0 0 10px rgba(0, 0, 0, .15);
                 font-size: 16px;
                 line-height: 24px;
                 font-family: 'Helvetica Neue', 'Helvetica',
                 color: #555;
                 }
                 .margin-top {
                 margin-top: 50px;
                 }
                 .justify-center {
                 text-align: center;
                 }
                 .resume-box table {
                 width: 100%;
                 line-height: inherit;
                 text-align: left;
                 }
                 .resume-box table td {
                 padding: 5px;
                 vertical-align: top;
                 }
                 .resume-box table tr td:nth-child(2) {
                 text-align: right;
                 }
                 .resum-box table tr.top table td {
                 padding-bottom: 20px;
                 }
                 .resume-box table tr.top table td.title {
                 font-size: 45px;
                 line-height: 45px;
                 color: #333;
                 }
                 .resume-box table tr.information table td {
                 padding-bottom: 30px;
                 }
                 .heading {
                 background: white;
                 border-bottom: 1px solid #ddd;
                 font-weight: bold;
                 }
                 .resume-box table tr.details td {
                 padding-bottom: 20px;
                 }
                 .resume-box table tr.item td {
                 border-bottom: 1px solid white;
                 }
                 .-box table tr.item.last td {
                 border-bottom: none;
                 }
                 .resume-box table tr.total td:nth-child(2) {
                 border-top: 2px solid #eee;
                 font-weight: bold;
                 }
                 @media only screen and (max-width: 600px) {
                 .resumw-box table tr.top table td {
                 width: 100%;
                 display: block;
                 text-align: center;
                 }
                 .resume-box table tr.information table td {
                 width: 100%;
                 display: block;
                 text-align: center;
                 }
                 }
              </style>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    
           </head>
           <body>
           <div class="resume-box">
           <table cellpadding="0" cellspacing="0">
               <tr class="top">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td class="title"><img class='rounded' src=${img} alt="nothing" width="160" height="160"></td>
                           <td>
                              Date: ${`${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}.`}
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr class="information">
                  <td colspan="2">
                     <table>
                        <tr>
                           <td>
                               <h2> ${name}</h2>
                               <h4> ${designation}</h4>
                           </td>
                           <td>
                              <h4>Email: ${email}</h4>
                              <h3>Address: ${location}</h3>
                           </td>
                        </tr>
                     </table>
                  </td>
               </tr>
               <tr>
                  <td><h3 class="heading">Objective:</h3><br>
                   <p class="">Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias veritatis ullam nisi incidunt illo reprehenderit accusantium nesciunt beatae inventore similique, eveniet culpa numquam iusto perferendis ducimus! Eum expedita, tempora sapiente praesentium assumenda omnis hic facere ad est dolor magnam atque veniam molestias repellat eveniet nam illo laborum debitis sint voluptates.</p></td>
                
               </tr>
               <tr>
                  <td><h3 class="heading">Education:</34>
                  <h6>${education}</h6>
               <p class='text-lead'>${institute}</p>
               </td>
               </tr>
               <tr class="item">
                  <td><h3 class="heading">Expreience:</h3>
                  <div>
                  <h6>${designation}</h6><p class='text-lead'>${company}</p></div>
                  </td>
               </tr>
               <tr class="item">
                  <td><h3 class="heading">Skills:</h3>
                  <p class='text-lead'>${skills}</p></td>
                  
               </tr>
               <tr class="item">
                  <td><h3 class="heading">Languages:</h3>
                  <p class='text-lead'>${languages}</p></td>
               </tr>
            </table>
            <br />
            
         </div>
                 
           </body>
        </html>
        `;
    };